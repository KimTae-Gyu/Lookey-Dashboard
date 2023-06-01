//화면 캡쳐 서버단
const express = require('express');
const multer = require('multer'); //파일업로드 처리 미들웨어
const bodyParser = require('body-parser');
const cors = require('cors');
// 라우팅을 파일 단위로 분리 할 수 있음.

const app = express();
const upload = multer({ dest: '../pic/' }); //파일저장 디렉토리
//const captureRouter = express.Router(); // 라우터 객체 생성

app.use(cors());
app.options('/capture', cors()); // Preflight 요청에 대한 응답을 허용하기 위한 옵션 설정
app.use(bodyParser.raw({ limit: '10mb', type: 'image/*' }));

// 이미지 다운로드를 처리하는 라우터
app.post('/capture', upload.single('image.jpg'), (req, res) => {
  const file = req.file; // 업로드된 파일에 대한 정보
  // 파일 처리 로직 작성
  res.send('File uploaded successfully');
});
/*
captureRouter.post('http://127.0.0.1:3000/capture', (req, res) => {
    const imageData = req.body.image;
  // 이미지 데이터를 클라이언트로 응답
    res.send(imageData);
});
*/
module.exports = app; // 이렇게 라우터를 export 해주면 됨.