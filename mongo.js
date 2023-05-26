const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const uri = process.env.MONGO_URI;

function mongoInsert(logs) {
  // MongoDB 연결 설정
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB에 연결되었습니다.');
  })
  .catch((error) => {
    console.error('MongoDB 연결 에러:', error);
  });

// 컬렉션 이름
const collectionName = 'waf';

// 문서 삽입
mongoose.connection.collection(collectionName).insertMany(logs)
.then(() => {
  console.log('문서들이 성공적으로 삽입되었습니다.');
  // MongoDB 커넥션 종료
  mongoose.connection.close()
  .then(() => {
    console.log('MongoDB 커넥션을 종료했습니다.');
  })
  .catch((error) => {
    console.error('MongoDB 커넥션 종료 에러:', error);
  });
})
.catch((error) => {
  console.error('문서 삽입 에러:', error);
});

  // mongoose.connect(uri, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true
  // });
  
  // const wafSchema = new mongoose.Schema({
  //   timestamp: { type: Date, default: Date.now },
  // });
  
  // const Waf = mongoose.model('Waf', wafSchema, 'waf');
  
  // //const newDocument = new Waf({ timestamp: new Date() });
  // const newDocument = new Waf(log);

  // newDocument.save()
  //   .then(savedDocument => {
  //     console.log('문서가 저장되었습니다.');
  //     console.log(savedDocument);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });
  }

  module.exports = mongoInsert;
