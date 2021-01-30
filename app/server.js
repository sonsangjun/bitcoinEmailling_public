//필요한 모듈 선언
var express = require('express');
var http = require('http');
var logger = require('./conf/winston');

var app = express();

////////////////////////////////////////////////////////////////////////////////////////////////////
// NODE_ENV기본설정 
(function(){
    const envir = process.env.NODE_ENV;
    process.env.NODE_ENV = ( envir && (envir).trim().toLowerCase() == 'production') ? 'production' : 'development';
})();

console.log('env : ',app.get('env'));

////////////////////////////////////////////////////////////////////////////////////////////////////
//express 서버 포트 설정
const portValue = (process.env.NODE_ENV =='production' ? 8011 : 18011 );
app.set('port', portValue);

////////////////////////////////////////////////////////////////////////////////////////////////////
//서버 생성
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    logger.info('Listening on port '+app.get('port'));
});

////////////////////////////////////////////////////////////////////////////////////////////////////
//라우팅 모듈 선언
const errMaillingRouter = require('./routes/errMaillingRouter');

////////////////////////////////////////////////////////////////////////////////////////////////////
//request 요청 URL과 처리 로직을 선언한 라우팅 모듈 매핑
app.use('/mail',errMaillingRouter);

