const logger = require("../conf/winston");

let objUtil = {};

/**
 * 객체 내용을 String로 변환한다.
 * @param {any} arr 객체
 */
objUtil.objView = function(arr){
    let vStr = '';

    // 공백
    if(!arr){
        return '';
    }

    // 문자열, 숫자, 불값
    if(typeof arr === 'string' || typeof arr === 'number' || typeof arr === 'boolean' ){
        return arr;
    }

    // 배열
    if(arr && Array.isArray(arr) && arr.length > 0){
        vStr+='[';
        arr.forEach(function(el,index){
            vStr+=index+':'+objUtil.objView(el); 
            vStr+=(index < arr.length-1 ? ', ' : '');
        });
        vStr+=']';

        return vStr;
    }

    // Object
    const keys = Object.keys(arr);

    if((keys && keys.length > 0)){
        vStr+='{';
    
        keys.forEach(function(el,index){
            vStr+=keys[index]+':'+objUtil.objView(arr[el]); 
            vStr+=(index < keys.length-1 ? ', ' : '');
        });
    
        vStr+='}';

        return vStr;
    }

    // Others cnvt String.
    return arr.toString();
};


/**
 * 값을 Type에 맞게 변경
 * @param {any} value 본래값
 */
objUtil.parseValue = function(value){
    if(value==null || value==undefined){
        return value;
    }
    
    // Boolean체크
    const booVal = String(value).toUpperCase();

    if(booVal==='TRUE' || booVal==='FALSE'){
        return (booVal==='TRUE' ? true : false);
    }

    // Number or String 체크
    const numVal = Number(value);

    if(String(numVal) === 'NaN'){
        // String 간주
        return value;
    }

    return numVal;
};

/**
 * dealSetting값을 json로 변환
 */
objUtil.dealSetting2Json = function(result){
    const dealSet = {};

    result.forEach((obj)=>{
        // '.'으로 스플릿하여 최대 5개구분자까지 처리
        const sKey = obj.setting_key;
        const sKeyArr = sKey.split('.');
        const sKeyLen = sKeyArr.length;
        const sVal = objUtil.parseValue(obj.setting_value);

        switch(sKeyLen){
            case 1 : 
                dealSet[sKey] = sVal; 
                break;

            case 2 : 
                if(!dealSet[sKeyArr[0]]){ dealSet[sKeyArr[0]] = {}; }

                dealSet[sKeyArr[0]][sKeyArr[1]] = sVal; 
                break;
            
            case 3 : 
                if(!dealSet[sKeyArr[0]]){ dealSet[sKeyArr[0]] = {}; }
                if(!dealSet[sKeyArr[0]][sKeyArr[1]]){ dealSet[sKeyArr[0]][sKeyArr[1]] = {}; }
                
                dealSet[sKeyArr[0]][sKeyArr[1]][sKeyArr[2]] = sVal;
                break;
            
            default : 
                break;
        }
    });

    return dealSet;
};

objUtil.getYYYYMMDD = function(timestamp) {
    const dObj = new Date(timestamp);
    var mm = dObj.getMonth() + 1;
    var dd = dObj.getDate();
  
    return [dObj.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
};

objUtil.getHHMMSS = function(timestamp) {
    const dObj = new Date(timestamp);
    var hh = dObj.getHours();
    var mm = dObj.getMinutes();
    var ss = dObj.getSeconds();
  
    return [(hh>9 ? '' : '0') + hh,
            (mm>9 ? '' : '0') + mm,
            (ss>9 ? '' : '0') + ss,
           ].join('');
};

objUtil.getHHMM = function(timestamp){
    return objUtil.getHHMMSS(timestamp).substr(0,4);
}

/**
 * YYYYMMDDHHMMSS 꼴로 반환
 * @param {any} timestamp 유닉스타임
 */
objUtil.getFullTime = function(timestamp){
    return objUtil.getYYYYMMDD(timestamp) + objUtil.getHHMMSS(timestamp) ;
};

/**
 * 현재 개발계인지 운영계인지 값 반환
 */
objUtil.getMode = function(){
    return process.env.NODE_ENV !== 'production' ? 'development' : 'production';
}

/**
 * 개발계인지 체크
 */
objUtil.checkDevMode = function(){
    return (objUtil.getMode() !== 'production');
}

module.exports = objUtil;