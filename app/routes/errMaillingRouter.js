// express setting
const express = require('express');
const router = express.Router();

const logger = require('../conf/winston');
const mailObj = require('../service/errMaillingService');
const jsonUtil = require('../util/jsonUtil');

module.exports = router;
////////////////////////////////////////////////////////////////////////////////////////////////////
// Router
// 일별 수익/수수료 정보조회

// jsonMsg 초기화
const jsonObj = jsonUtil.getJsonObj('errMaillingRouter');

/**
 */
router.get('/mailling', function(req, res, next) {
    
    logger.info('mailling');
    mailObj.run()
    .then((json)=>res.send(json))
    .catch((err)=>res.send(jsonObj.getMsgJson('-1',err)));
});