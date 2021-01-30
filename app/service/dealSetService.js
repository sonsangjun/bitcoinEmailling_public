const objUtil = require('../util/objectUtil');
const logger = require('../conf/winston');
const sqlObj = require('../util/sqlUtil');
const jsonUtil = require('../util/jsonUtil');

module.exports = (function(){
    let dSetObj = {};

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // 기본 값 정의  
    let dealSet = {
        // API정보
        // API baseUrl : 호출 기본경로
        // API PrivateKey : SecretKey이므로 노출시 재발급 받아야함.
        // API Key(RequestHeader에 설정)
        baseUrl : 'https://api.binance.com',
        APIPkey : '',
        APIKey : '',
        
        // 소숫점 자리(실제 비트코인 거래Method는 적용하면 안됨)
        floatFixed : 5,
    
        // 거래타입
        tradeType : {
            BUY : 'B',
            SELL : 'S'
        },
    
        // 매도 타입(일반/청산)
        sellType : {
            GENERAL : 'general',
            CLEARING : 'clearing'
        },
        
        // 쿨타임 타입(일반/청산)
        // coolTimeInterval : 대기시간(sec)
        coolTimetype : {
            GENERAL  : 300,
            CLEARING : 600
        },
    
        // 매수매도 조건 가격차이
        // buyCond : 매수조건, sellCond : 매도조건, rateGap : 유효간극(0.1==> 10%차이시 도달이라 가정)
        // hitWeight 가중치.(최고가 갱신시 카운트 가중치를 둠.)
        buyCond : -0.3,
        sellCond : 0.3,
        rateGap : 0.1,
        hitWeight : 2,

        maxHitCond : {
            SELL : 10,
            BUY : 10
        },
        
        // Bit코인최대단위(소숫점단위)
        bitFixed : 8,
    
        // 매매수수료율(0.1,단위 %)
        // BNB코인결제시, 0.05%
        sbFee : 0.05,
    
        // 검사시간(sec)
        intervalTime : 3,
    
        // maxTradesLength (가져올 호가단위)
        maxTradesLength : 5,

        // initAccUsdt : 초기자본
        // sbCash : 고정매매금액
        initAccUsdt : 24000,
        sbCash : 2400,

        // recvWindow(mSec, HMAC SHA256 생성시 사용)
        recvWindow : 5000,

        // 거래심볼
        symbol : 'BTCUSDT',

        // 메일사용
        mail : {
            isUse : false,
            reportTime : '1800'
        },

        exchangeInfo : null,

        // 켈리공식을 이용한 베팅규모 동적조절여부
        // minSbCash은 거래소 최소거래단위인 10이 최소값.
        // modKellyRate는 켈리비율 보정수치(%)
        isUseKellyBetSbCash : false,
        minSbCash : 12,
        modKellyValue : 50,

        // 메일링 변수
        errMail : {
            definedHour : 1,
            definedCnt : 5
        }
    };

    /**
     * 기본 설정 값 가져오기
     */
    dSetObj.getDefaultSet = function(){
        return dealSet;
    };

    /**
     * 디비로부터 정보 가져오기
     */
    dSetObj.selectDealSetFromDB = function(){
        logger.debug('setDealSetting start ==> ');

        return (new Promise((resolve,reject)=>{
            sqlObj.selectDealSetting().then((result)=>{
                // DealSet 설정
                // dealSet
                jsonResult = objUtil.dealSetting2Json(result);

                logger.debug('setDealSetting complete ==> '+objUtil.objView(dealSet));
                resolve(jsonResult);

            }).catch((err)=>{
                reject(jsonUtil.getMsgJson('-1',err));
            });
        }));
    };

    return dSetObj;
})();