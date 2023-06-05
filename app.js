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
const { wafMongoInsert, nfwMongoInsert, mongoWafGroupBy, mongoNfwGroupBy } = require('./mongo.js');
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

// 라우트 파일 import
const indexRouter = require('./routes/index'); 
const loginRouter = require('./routes/login');
const controlRouter = require('./routes/control.js');

// 미들 웨어 영역, 미들웨어 순서 생각
app.use(morgan('dev')); // 배포 시에는 'dev'대신 'combined'를 사용하는 것이 일반적.
app.use(express.static(path.join(__dirname, '.'))); // 정적 파일(html, css) 접근하게 해주는 코드
app.use(express.json({
	type: [
		'application/json',
		'text/plain',
	],
}));
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터를 추출해 req.body에 저장, 없으면 Form을 통해 POST로 보낸 데이터 접근 불가
app.use(cors({
	origin: ["http://52.6.101.20:3000","https://geolite.info/geoip/v2.1/city/219.240.87.167"], // 접근 권한을 부여하는 도메인
	credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
	optionsSuccessStatus: 200, // 응답 상태 200으로 설정
	allowedHeaders: '*',
	exposedHeaders: 'Access-Control-Allow-Origin'
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
app.use('/control', controlRouter); // localhost:3000/control 으로 들어오는 요청을 loginRouter로 라우팅.

//------------------------------------------------------

// lambda에서 NFW 로그를 발송할때 받는 라우팅
app.post('/log/nfw', (req, res) => {
	let nfw_logs = req.body;
	// 로그가 새로 추가되었으므로 로그 테이블에 새로운 데이터 추가 및 차트 데이터 갱신 이벤트 전송
	io.emit('nfwNewLogs');
	res.sendStatus(200);
});

// NFW 블락 로그가 새로 생겼다는 플래그를 수신
// nfwNew 이벤트를 발행
app.post('/log/nfw/new', (req, res) => {
	let nfw_flag = req.body.message;
	console.log("NFW New Log Flag", nfw_flag);

	io.emit('nfwNew');
});

// nfwNew 이벤트를 받아서 차트와 맵을 새로 렌더링할 때 호출
// 클라이언트는 /log/nfw/groupBy로 새로운 nfw 데이터를 갱신받음
app.get('/log/nfw/groupBy', (req, res) => {
	mongoNfwGroupBy(mongoConnection)
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((error) => {
			console.error(error);
		});
});

//------------------------------------------------------

// lambda에서 WAF 로그를 발송할때 받는 라우팅
app.post('/log/waf', (req, res) => {
	let logs = req.body;
	// 로그가 새로 추가되었으므로 로그 테이블에 새로운 데이터 추가 및 차트 데이터 갱신 이벤트 전송
	io.emit('wafNewLogs');
	res.sendStatus(200);
});

// WAF 블락 로그가 새로 생겼다는 플래그를 수신
// wafNew 이벤트를 발행
app.post('/log/waf/new', (req, res) => {
	let waf_flag = req.body.message;
	console.log("NFW New Log Flag", waf_flag);

	io.emit('wafNew');
});

// wafNew 이벤트를 받아서 차트와 맵을 새로 렌더링할 때 호출
// 클라이언트는 /log/waf/groupBy로 새로운 waf 데이터를 갱신받음
app.get('/log/waf/groupBy', (req, res) => {
	mongoWafGroupBy(mongoConnection)
		.then((result) => {			
			res.status(200).json(result);
		})
		.catch((error) => {
			console.error(error);
		});
});

//------------------------------------------------------

// 메인 페이지의 NFW 차트 데이터 전송
// app.get('/log/nfw/chart', (req, res) => {
// 	mongoNfwGroupBy(mongoConnection)
// 		.then((result) => {
// 			console.log('NFW Group By: ', result);
// 			res.status(200).json(result);
// 		})
// 		.catch((error) => {
// 			console.error(error);
// 		});
// });

app.get('/geoip', (req, res) => {
	const ipAddress = req.query.ip;
	const apiUrl = `https://geolite.info/geoip/v2.1/city/${ipAddress}`;
	const username = '867355';
	const password = '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';
	const headers = {
		Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
		Accept: 'application/json',
	};

	fetch(apiUrl, { headers })
		.then(response => {
			//console.log(response);
			//console.log(response.json());
			if (response.ok) {
				return response.json();
			} else {
				throw new Error('Request failed. Status:', response.status);
			}
		})
		.then(data => { 
      loc_data={lat:data.location.latitude, lng:data.location.longitude};
      res.status(200).json(loc_data); // 서버에서 받은 응답을 클라이언트에게 전달
		})
		.catch(error => {
			console.error('Request failed:', error.message);      
			res.status(500).send('Internal Server Error');
		});
});

// 메인 페이지의 map에 데이터 전송
// app.get('/log/nfw/map', (req, res) => {
// 	mongoNfwGroupBy(mongoConnection)
// 		.then((result) => {
//       		console.log('nfw Group By: ', result);
// 			res.status(200).json(result);
// 		})
// 		.catch((error) => {
// 			console.error(error);
// 		});
// });
	
app.get('/alarm', (req, res) => {
	const subscribeURL = req.query.SubscribeURL;
	fetch(subscribeURL, { method: 'GET' })
	.then(response => {
		if(response.ok) {
			console.log('Subscription Confirmed');
			res.sendStatus(200);
		} else {
			console.error('Subscription Failed');
			res.sendStatus(500);
		}
	})
	.catch(error => {
		console.error('Subscription failed: ', error);
		res.sendStatus(500);
	});
});

app.post('/alarm', (req, res) => {
	console.log('subscribe: ', req.body);
	console.log('subscribe header: ', req.headers);
	console.log('Message : ', req.body.SubscribeURL);
	io.emit('alarm');
});

io.on('connection', (socket) => {
	console.log('클라이언트가 연결되었습니다.');
	// socket.on('wafLogs', (data) => {
	//   console.log('클라이언트로부터 wafLogs 이벤트를 받았습니다.');
	//   console.log('Data : ', data);
	// });
});
// 서버 종료시 DB들의 커넥션 종료 코드

http.listen(process.env.PORT || 3000, () => {
	process.env.PORT ? console.log(process.env.PORT + '번 포트 서버 실행중') : console.log('3000번 포트 서버 실행중');
});
