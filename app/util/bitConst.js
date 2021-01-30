module.exports = (function(){
    let constant = {};

    constant.TRADE_SYMBOL_USDT = {};
    constant.TRADE_SYMBOL_USDT.BTC = 'BTCUSDT';

    constant.FEE_BTC = {};
    constant.FEE_BTC.BNB = 'BNBBTC';

    constant.DATE_TYPE = {};
    constant.DATE_TYPE.DAY = 'D';
    constant.DATE_TYPE.MON = 'M';
    constant.DATE_TYPE.YER = 'Y';
    
    constant.DATE_MSEC = {};

    constant.DATE_MSEC.HOUR = 3600*1000;
    constant.DATE_MSEC.DAY = 86400*1000;

    constant.YN={};
    constant.YN.Y = 'Y';
    constant.YN.N = 'N';

    return constant;

})();