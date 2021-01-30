const bConst = require('../util/bitConst');
const obj2Str = require('./objectUtil');
const logger = require('../conf/winston');
const mysql = require('mysql');

let mysqlConfig = { };

// 
const thisOs = process.env.OS;
const dbHost = '0.0.0.0'; // 접속할 DB IP
// const dbHost = (thisOs == 'Windows_NT' ? '0.0.0.0' : 'localhost');

if (process.env.NODE_ENV !== 'production') {
    mysqlConfig = {
        host : dbHost,
        user : 'ID입력',
        password : '암호입력',
        database : 'bitcoin_dev'        
    };
}else{
    mysqlConfig = {
        host : dbHost,
        user : 'ID입력',
        password : '암호입력',
        database : 'bitcoin'        
    };
}

const connection = mysql.createConnection(mysqlConfig);
connection.connect();

let sqlObj = {};

(function(){
    sqlObj.connect = function(){
        connection.connect();
    };
    ////////////////////////////////////////////////////////////
    // Promise
    /**
     * 반환값 꼴
     * err null (에러나봐야 알 것 같다.)
     * 
     * result OkPacket {
     * fieldCount: 0,
     * affectedRows: 1,
     * insertId: 0,
     * serverStatus: 2,
     * warningCount: 0,
     * message: '',
     * protocol41: true,
     * changedRows: 0 
     * }
     * @param {any} query 쿼리문
     * @param {any} values insert시 값
     */
    function queryPromise(query, values){
        const promise = new Promise(
            (resolve, reject)=>{
                if(query && values && values.length > 0){
                    logger.info('queryPromise ==> query OK, values OK');
                    connection.query(query,values, function(err, result){
                        if(err){
                            logger.info('err');
                            logger.info(err);
                            return reject(err);
                        }
    
                        return resolve(result);
                    });

                }else{
                    logger.info('queryPromise ==> query OK');
                    connection.query(query, function(err, result){
                        if(err){
                            return reject(err);
                        }
    
                        return resolve(result);
                    });
                }
            }
        );

        return promise;
    }

    ////////////////////////////////////////////////////////////
    // Select
    sqlObj.selectErrorHistory = function(){
        let queryStr = 'select * from error_history where del="N" and sendFlag="N" '

        logger.info('[selectErrorHistory] query : '+queryStr);

        return queryPromise(queryStr);
    };

    sqlObj.selectErrorCnt = function(){
        let queryStr = 'select count(*) cnt from error_history where del="N" and sendFlag="N" '

        logger.info('[selectErrorCnt] query : '+queryStr);

        return queryPromise(queryStr);
    };

    sqlObj.selectDealSetting = function(){
        let queryStr = 'select * from deal_settings where del="N";'

        logger.info('[selectDealSetting] query : '+queryStr);

        return queryPromise(queryStr);
    };

    ////////////////////////////////////////////////////////////
    // Insert
    sqlObj.insertErrorHistory = function(arr){
        const queryStr = 'INSERT INTO error_history (errorMsg ,errorTime ,sendFlag ,sendTime ,del ) VALUES (?);';
        let values = [];

        logger.info('[insertErrorHistory] query : '+queryStr);
        
        if(arr && arr.length > 0){
            arr.forEach(el => {
                const value = [
                    el.errorMsg 
                    ,el.errorTime 
                    ,el.sendFlag 
                    ,el.sendTime 
                    ,'N'
                ];
                values.push(value);
            });

        }

        logger.debug('values ==> \n'+obj2Str.objView(values));
        return queryPromise(queryStr, values);
    };

    sqlObj.insertEmailSendHistory = function(arr){
        const queryStr = 'INSERT INTO email_send_history (email_subject, email_content, sendTime, del) VALUES (?);';
        let values = [];

        logger.info('[insertEmailSendHistory] query : '+queryStr);
        
        if(arr && arr.length > 0){
            arr.forEach(el => {
                const value = [el.email_subject, el.email_content, el.sendTime, 'N'];
                values.push(value);
            });

            logger.debug('values ==> \n'+obj2Str.objView(values));
            return queryPromise(queryStr, values);
        }
    };

    ////////////////////////////////////////////////////////////
    // Update
    sqlObj.updateSendingMail = function(arr){
        let queryStr = 'UPDATE error_history SET ';
        let whereIn = [];
        let values = [];

        if(arr && arr.length > 0){
            const sendFlag = arr[0].sendFlag;
            const sendTime = arr[0].sendTime;

            queryStr += (' sendFlag="'+sendFlag+'"');
            queryStr += (',sendTime="'+sendTime+'"');
            queryStr += (' WHERE errorId IN (?) ');


            arr.forEach(el => {
                whereIn.push(el.errorId);
            });

            values.push(whereIn);
        }

        logger.info('[updateSendingMail] query : '+queryStr);
        logger.debug('values ==> \n'+obj2Str.objView(values));
        return queryPromise(queryStr, values);
    }

})();

module.exports = sqlObj;