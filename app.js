const express = require('express');
const dotenv = require('dotenv'); // process.env 설정
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./passport');
const morgan = require('morgan'); // 서버에 들어온 요청과 응답의 로그를 출력
const mysql = require('mysql');
const cors = require('cors');
const { wafParse, nfwParse } = require('./logParse.js');
const { mongoInsert, mongoWafGroupBy } = require('./mongo.js');
const mongoose = require('mongoose');

dotenv.config(); // .env 파일 내용을 process.env에 적재
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// 템플릿 엔진(EJS) 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MySQL 설정 및 연결
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 여기에 위치해야 하는지 로그인 passport 인증 준비 단계에서 연결해야 하는지?
connection.connect((err) => {
  if (err) throw err;
  console.log('MySQL 연결 성공');
});

// MongoDB 설정 및 연결
const mongoConnection = mongoose.createConnection(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// MongoDB 연결 성공 및 실패 이벤트 처리
mongoConnection.on('connected', () => {
  console.log('몽고DB 커넥션이 성공적으로 연결되었습니다.');
});
mongoConnection.on('error', (error) => {
  console.error('몽고DB 커넥션 에러:', error);
});

// connectMongoDB()
//   .then((mongoConnection) => {
//     const collection = mongoConnection.collection('wafs2');

//     collection.watch().on('change', (change) => {
//       console.log('WAF 컬렉션 변경 사항 : ', change);
//       if (change.operationType === 'insert') {
//         const newDocument = change.fullDocument;
//         // WAF 변경 이벤트 발행 -> 차트, 테이블
//         setInterval(() => {
//           io.emit('wafChart');
//           //io.emit('wafTable', newDocument);
//         }, 5000);
//       }
//     });
//   })
//   .catch((error) => {
//     console.error('MongoDB Connection Error: ', error);
//   });

// 라우트 파일 import
const indexRouter = require('./routes/index'); 
const loginRouter = require('./routes/login');

// 미들 웨어 영역, 미들웨어 순서 생각
app.use(morgan('dev')); // 배포 시에는 'dev'대신 'combined'를 사용하는 것이 일반적.
app.use(express.static(path.join(__dirname, '.'))); // 정적 파일(html, css) 접근하게 해주는 코드
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터를 추출해 req.body에 저장, 없으면 Form을 통해 POST로 보낸 데이터 접근 불가
app.use(cors({
  origin: "http://127.0.0.1:3000", // 접근 권한을 부여하는 도메인
  credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
  optionsSuccessStatus: 200, // 응답 상태 200으로 설정
}));
app.use(session({
    secret: process.env.SESSION_SECRET, // # 세션 시크릿 키를 어떻게 할 것인지 생각 .env 파일에 저장해 직접 입력을 피함
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passportConfig(connection); // Passport 로그인 설정 모듈

app.use('/', indexRouter); // localhost:3000/ 으로 들어오는 요청을 indexRouter 객체를 이용해 라우팅.
app.use('/login', loginRouter); // localhost:3000/login 으로 들어오는 요청을 loginRouter로 라우팅.
// 소켓 부분
app.get('/socket', (req, res) => {
  res.sendFile(path.join(__dirname, './socketTest.html'));
});
// lambda에서 WAF 로그를 발송할때 받는 라우팅
app.post('/log/waf', (req, res) => {
  // let logs = [{"timestamp":1684825816966,"formatVersion":1,"webaclId":"arn:aws:wafv2:us-east-1:944697335072:regional/webacl/cloudmonitoring-waf/8acf338d-9594-449d-b99a-f4e88a4cbac5","terminatingRuleId":"AWS-AWSManagedRulesAnonymousIpList","terminatingRuleType":"MANAGED_RULE_GROUP","action":"BLOCK","terminatingRuleMatchDetails":[],"httpSourceName":"ALB","httpSourceId":"944697335072-app/alb/1e3b6eac51c9c245","ruleGroupList":[{"ruleGroupId":"AWS#AWSManagedRulesCommonRuleSet","terminatingRule":null,"nonTerminatingMatchingRules":[],"excludedRules":null,"customerConfig":null},{"ruleGroupId":"AWS#AWSManagedRulesAnonymousIpList","terminatingRule":{"ruleId":"HostingProviderIPList","action":"BLOCK","ruleMatchDetails":null},"nonTerminatingMatchingRules":[],"excludedRules":null,"customerConfig":null}],"rateBasedRuleList":[],"nonTerminatingMatchingRules":[],"requestHeadersInserted":null,"responseCodeSent":null,"httpRequest":{"clientIp":"185.254.196.186","country":"US","headers":[{"name":"Host","value":"52.54.199.152"},{"name":"User-agent","value":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36"},{"name":"Accept-Encoding","value":"gzip, deflate"},{"name":"Accept","value":"*/*"},{"name":"Connection","value":"keep-alive"}],"uri":"/.env","args":"REDACTED","httpVersion":"HTTP/1.1","httpMethod":"GET","requestId":"1-646c66d8-23174f95617bd0c633b81f3a"},"labels":[{"name":"awswaf:managed:aws:anonymous-ip-list:HostingProviderIPList"}]},
  // {"timestamp":1684825826966,"formatVersion":1,"webaclId":"arn:aws:wafv2:us-east-1:944697335072:regional/webacl/cloudmonitoring-waf/8acf338d-9594-449d-b99a-f4e88a4cbac5","terminatingRuleId":"AWS-AWSManagedRulesAnonymousIpList","terminatingRuleType":"MANAGED_RULE_GROUP","action":"BLOCK","terminatingRuleMatchDetails":[],"httpSourceName":"ALB","httpSourceId":"944697335072-app/alb/1e3b6eac51c9c245","ruleGroupList":[{"ruleGroupId":"AWS#AWSManagedRulesCommonRuleSet","terminatingRule":null,"nonTerminatingMatchingRules":[],"excludedRules":null,"customerConfig":null},{"ruleGroupId":"AWS#AWSManagedRulesAnonymousIpList","terminatingRule":{"ruleId":"HostingProviderIPList","action":"BLOCK","ruleMatchDetails":null},"nonTerminatingMatchingRules":[],"excludedRules":null,"customerConfig":null}],"rateBasedRuleList":[],"nonTerminatingMatchingRules":[],"requestHeadersInserted":null,"responseCodeSent":null,"httpRequest":{"clientIp":"185.254.196.186","country":"US","headers":[{"name":"Host","value":"52.54.199.152"},{"name":"User-agent","value":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36"},{"name":"Accept-Encoding","value":"gzip, deflate"},{"name":"Accept","value":"*/*"},{"name":"Connection","value":"keep-alive"}],"uri":"/.env","args":"REDACTED","httpVersion":"HTTP/1.1","httpMethod":"GET","requestId":"1-646c66d8-23174f95617bd0c633b81f3a"},"labels":[{"name":"awswaf:managed:aws:anonymous-ip-list:HostingProviderIPList"}]}];
  let logs = req.body;
  console.logs('WAF Inserted: ', logs);
  // console.log(logs);
  // if(logs.length > 0) {
  //   logs = wafParse(logs);
  //   mongoInsert(mongoConnection, logs);
  // }
  // console.log(logs.length); 

  // 로그가 새로 추가되었으므로 로그 테이블에 새로운 데이터 추가 및 차트 데이터 갱신 이벤트 전송
  io.emit('wafChart');
  //io.emit('wafTable', logs);
  res.sendStatus(200);
});
// 메인 페이지의 WAF 차트 데이터 전송
app.get('/log/waf/chart', (req, res) => {
  mongoWafGroupBy(mongoConnection)
    .then((result) => {
      console.log(result);
      res.sendStatus(200).json(result);
    })
    .catch((error) => {
      console.error(error);
    });
});
// 메인 페이지의 NFW 차트 데이터 전송
// app.get('/log/nfwChart', (req, res) => {
// });

io.on('connection', (socket) => {
  console.log('클라이언트가 연결되었습니다.');
  // socket.on('wafLogs', (data) => {
  //   console.log('클라이언트로부터 wafLogs 이벤트를 받았습니다.');
  //   console.log('Data : ', data);
  // });
});

// 서버 종료시 DB들의 커넥션 종료 코드

http.listen(process.env.PORT || 3000, () => {
  process.env.PORT ? console.log(process.env.PORT + '번 포트 서버 실행중') : console.log('3000번 포트 서버 실행 중');
});