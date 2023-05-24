const express = require('express');
const dotenv = require('dotenv'); // process.env 설정
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./passport');
const morgan = require('morgan'); // 서버에 들어온 요청과 응답의 로그를 출력
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');

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

const indexRouter = require('./routes/index'); // 라우트 파일 import
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

app.post('/log/waf', (req, res) => {
  const logs = JSON.stringify(req.body);
  console.log(logs);
  const filePath = './logs/wafLogs.txt';
  fs.appendFile(filePath, logs, (err) => {
  	if (err) {
		console.error('파일에 추가 실패', err);
		return;
	}
	console.log('파일에 내용이 성공적으로 추가되었습니다.');
  });

  io.emit('wafLogs', logs);
  res.sendStatus(200);
});

io.on('connection', (socket) => {
  console.log('클라이언트가 연결되었습니다.');
  socket.on('wafLogs', (data) => {
    console.log('클라이언트로부터 wafLogs 이벤트를 받았습니다.');
    console.log('Data : ', data);
  });
});

// app.listen(process.env.PORT || 3000, (req, res) => {
//   process.env.PORT ? console.log(process.env.PORT + '번 포트 서버 실행중') : console.log('3000번 포트 서버 실행 중');
// });

http.listen(process.env.PORT || 3000, () => {
  process.env.PORT ? console.log(process.env.PORT + '번 포트 서버 실행중') : console.log('3000번 포트 서버 실행 중');
});
