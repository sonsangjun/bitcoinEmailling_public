# 일정(할일)

```
완료.

nodejs express 구축.
nodejs docker 설정.
nodejs logger 설정.

자동매매 로직 초안 개발완료.
현재 테스트 진행중.

TODO 12.27
- (O) Mysql docker 구축 및 nodejs docker와 연결
- (O) Mysql에 거래기록 등. 쌓기위한 사전작업(스키마 정의)

TODO 12.30
- (O)개발/운영(DB,프로세스) 분리완료. 운영 실거래API 확인후 POC진행할것
- (O)nodejs를 통해 현재 상황을 볼 수 있는 API 구상할 것(권한부여, 민감정보임)
     init/run등등의 API는 현재 구성완료.
     외부에서 API호출을 금지하는게 원칙이므로,
  
     기능개발은 하지 않을 것.
     대신, 매일 1회 이메일 정기보고.
  
-- 2021년
TODO 01.01
- 가능한 에러 발생시, DB에 쌓을 수 있도록 구상할 것.
  ==> 에러발생시, DB쌓는구조는 구글링 해봐야.
      일단, 이상거래 발생시 Email조치
      

TODO 01.30
-> 바이낸스 API의 가격조회기능이 지속적으로 장애가 발생함.
   당일 새벽 3시에도 그 부분으로 인해 nodejs서버가 4시간동안 죽어있었음. (docker status : exited)

   일단, setInterval -> setTimeout으로 변경하고,
        xhrGet timeout발생할 때까지 스케쥴링 대기.
        xhrGet timeout발생후, catch를 통해 에러를 잡고, order는 계속진행.
        (가격 조회API가 정상화 될 때까지.)
        
```
