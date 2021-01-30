const objUtil = require('../util/objectUtil');
const logger = require('../conf/winston');
const sqlObj = require('../util/sqlUtil');
const jsonUtil = require('../util/jsonUtil');
const dealSetSvc = require('./dealSetService');
const mailer = require('../util/emailUtil');

const bConst = require('../util/bitConst');

module.exports = (function(){
    ///////////////////////////////////////////////////////////////////
    // Init Area
    const jsonObj = jsonUtil.getJsonObj('errMaillingService');
    const isDev = objUtil.checkDevMode();

    let svcObj = {};
    let isSwitchOnProcessing = false;
    let dealSet = dealSetSvc.getDefaultSet();

    /**
     * 거래 서비스 기본설정 세팅
     */
    svcObj.setDealSetting = function(){
        logger.debug('setDealSetting start ==> ');

        return (new Promise((resolve,reject)=>{
            dealSetSvc.selectDealSetFromDB().then((result)=>{
                // DealSet 설정
                dealSet = result;
                logger.debug('setDealSetting complete ==> '+objUtil.objView(dealSet));
                resolve(result);

            }).catch((err)=>{
                svcObj.insertErrorCntn(jsonObj.getMsgJson('-1',err));
                reject(jsonObj.getMsgJson('-1',err));
            });
        }));
    };

    /**
     * 메일러 세팅
     */
    svcObj.setMailSvcForMailer = function(){
        logger.debug('setMailSvcForMailer start ==> ');

        return (new Promise((resolve,reject)=>{
            mailer.getTransporter().then(function(obj){
                mailSvc = obj;
                
                logger.debug('setMailSvcForMailer complete ==> '+objUtil.objView(obj));
                resolve(true);

            }).catch(function(err){
                errSvc.insertErrorCntn(jsonObj.getMsgJson('-1',err));
                reject(jsonObj.getMsgJson('-1',err));
            })
        }));
    };

    svcObj.run = function(){
        // 이미 떠 있으면 return;
        if(isSwitchOnProcessing){
            logger.debug(alreadyMsg);
            return jsonObj.getMsgJson('-1','mailling already run.');
        }

        return (new Promise((resolve, reject)=>{
            svcObj.setDealSetting()
            .then((result)=>{
                // mailSvc설정
                return svcObj.setMailSvcForMailer();
            }).then((result)=>{
                let lastMailling = Date.now();

                const prcsFn = function(){
                    logger.debug('======================= prcsMailling ======================= ');
                    const curMsec = Date.now();
                    const curHHMM = 'T'+objUtil.getHHMM(curMsec);
                    let errCnt = 0;
                    let maillingInterval = curMsec - lastMailling;

                    logger.debug('curHHMM :'+curHHMM+', lastMailling(mSec): '+lastMailling);

                    if(!isSwitchOnProcessing){
                        logger.debug('stop mailling.');
                        return ;
                    }
                    
                    sqlObj.selectErrorCnt().then((result)=>{
                        errCnt = (result && result.length>0 ? result[0].cnt : 0);

                        // 보내는 조건 (에러 내용이 있을때, 정해진 주기마다 or 정해진 갯수마다.)
                        // dealSet.errMail.definedHour / dealSet.errMail.definedCnt
                        logger.debug('result : '+objUtil.objView(result));
                        logger.debug('errCnt :'+errCnt+', maillingInterval: '+maillingInterval);

                        if((errCnt < 1)){
                            // 정해진 시간 OR 갯수를 충족하지 않는 경우. Waitting
                            setTimeout(prcsFn, dealSet.intervalTime*1000);

                        }else if((maillingInterval > bConst.DATE_MSEC.DAY) || (errCnt >= dealSet.errMail.definedCnt)){
                            // 정해진 시간 OR 갯수를 충족하는 경우
                            logger.debug('mailling start.');
                            lastMailling = curMsec;
                            sqlObj.selectErrorHistory().then((data)=>{
                                // 메일링 진행.
                                logger.debug('selectErrorHistory complete');
                                return svcObj.prcsSendingEmail(data);
                            }).then((errorIds)=>{
                                // 메일링 성공 및 DB에 SendFlag수정(N->Y)
                                logger.debug('prcsSendingEmail complete. '+objUtil.objView(errorIds));
                                return sqlObj.updateSendingMail(errorIds);
                            }).then(()=>{
                                // 메일링 성공. 스케쥴링 다시 진행
                                logger.debug('mailling success.');
                                setTimeout(prcsFn, dealSet.intervalTime*1000);                            
                            }).catch((err)=>{
                                // 메일링 중지.
                                logger.error('mailling fail. '+objUtil.objView(err));
                                svcObj.switchingOrderingFlag(false);
                                setTimeout(prcsFn, dealSet.intervalTime*1000);
                            });

                        }else{
                            // 정해진 시간 OR 갯수를 충족하지 않는 경우. Waitting
                            setTimeout(prcsFn, dealSet.intervalTime*1000);
                        }

                    }).catch((err)=>{
                        // 메일링 중지.
                        logger.error('mailling fail. '+objUtil.objView(err));
                        svcObj.switchingOrderingFlag(false);
                        setTimeout(prcsFn, dealSet.intervalTime*1000);
                    });
                }
        
                // 메일링시작.
                svcObj.switchingOrderingFlag(true);
                setTimeout(prcsFn, dealSet.intervalTime*1000);
        
                resolve(jsonObj.getMsgJson('0','mailling success.'));
            
            }).catch((err)=>{
                // 메일링에서 에러 발생시. 억지로 돌리지 않음.
                let errjson = jsonObj.getMsgJson('0',err);
                errjson.msg = errjson.msg+' | mailling is stop.(set dealSet fail)';                
                logger.error(errjson.msg);
                reject(errjson);
            });
        }));
    };

    /**
     * 에러 메일링 서비스 정지
     */
    svcObj.stop = function(){
        svcObj.switchingOrderingFlag(false);
        return jsonObj.getMsgJson('0','send signal [mailling service stop]');
    };

    /**
     * 에러목록에 대한 이메일 발송을 진행한다.
     * 반환값으로 발송한 errorIds를 반환한다.
     * @param {any} errList 에러목록
     */
    svcObj.prcsSendingEmail = function(errList){
        logger.debug('prcsSendingEmail call. ');

        const timestamp = Date.now();
        const title = mailSvc.noticeType.ERROR+' '+(isDev?'(DEV)':'')+'Report Server Error.';
        let content = '';
        let errCntn = '';
        let errCnt = 0;
        let errorIds = [];

        // 에러리스트 세팅
        if(errList && errList.length > 0){
            errCnt = errList.length;
            errList.forEach((obj)=>{
                errCntn+= '[ID:'+obj.errorId+'][Time:'+objUtil.getYYYYMMDD(obj.errorTime)+'.'+objUtil.getHHMM(obj.errorTime)+']<br/>'+obj.errorMsg+'<p/>'
                let uptJson = {};
                uptJson.errorId = obj.errorId;
                uptJson.sendTime = timestamp;
                uptJson.sendFlag = bConst.YN.Y;
                errorIds.push(uptJson);
            })
        }

        logger.debug('prcsSendingEmail errCnt:'+errCnt+', errorIds:'+objUtil.objView(errorIds));
        content = '안녕하세요. '+dealSet.mail.sender+'입니다.' +'<br>'
                    +'<br>'
                    + 'OrderServer에서 발생한 Error내역 공유드립니다.'+'<br>'
                    +'<br>'+'<br>'
                    + '* 보고된 에러갯수:'+errCnt+'<br>'
                    + '<br>'
                    + '[에러내역]'+'<br>'
                    + errCntn
                    + '<br>'
                    + '참고하시어 매매시 오류로 인한 불필요한 손실을 사전에 예방해주세요.' +'<br>'
                    + '<br>'
                    + '그럼,<br>'
                    + '오늘도 수고하세요~' +'<br>';

        logger.debug('send content ==> '+content);

        return (new Promise((resolve, reject)=>{
            mailSvc.staticSendMail(title, content, timestamp)
            .then((result)=>resolve(errorIds))
            .catch((err)=>reject(jsonObj.getMsgJson('-1',err)));
        }));
    };

    /**
     * isSwitchOnOrdering 값을 설정한다.
     * @param {any} flag boolean값
     */
    svcObj.switchingOrderingFlag = function(flag){
        isSwitchOnProcessing = flag;
    },

    /**
     * 에러내용을 테이블에 삽입.
     * @param {any} json 에러내용
     */
    svcObj.insertErrorCntn = function(json){
        if(!json){
            logger.debug(jsonObj.getMsgJson('-1','json is empty.'));
            return;
        }

        let el = {};
        el.errorMsg  = json.msg;
        el.errorTime = Date.now();
        el.sendFlag  = 'N';
        el.sendTime  = 0;

        sqlObj.insertErrorHistory([el])
        .then((res)=>logger.debug(jsonObj.getMsgJson('0','insertErrorCntn success.')))
        .catch((err)=>logger.error(jsonObj.getMsgJson('-1','insertErrorCntn fail. '+objUtil.objView(err))));
    };

    // 에러 메일링 보내는 것은 설정값에 주기를 1시간정도로 설정하여
    // 에러가 존재시, 메일보내고 없으면 보내지 말 것.
    // dealService의 setTimeout으로 돌리는 로직 참고.

    // 에러 메일링은 docker 분리적용

    return svcObj;
})();