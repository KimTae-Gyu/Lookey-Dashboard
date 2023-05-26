const dotenv = require('dotenv');
dotenv.config();
const uri = process.env.MONGO_URI;

function mongoInsert(connection, logs) {
  // 컬렉션 이름
  const collectionName = 'waf';
  // 문서 삽입
  connection.collection(collectionName).insertMany(logs)
    .then(() => {
      console.log('문서들이 성공적으로 삽입되었습니다.');
    })
    .catch((error) => {
      console.error('문서 삽입 에러:', error);
    });
}

function mongoWafGroupBy(connection) {
  // 컬렉션 이름
  const collectionName = 'waf';
  const collection = connection.collection(collectionName);
  // labels 필드로 그룹핑해서 카운트 상위 5개만 반환
  return collection.aggregate([
    { $unwind: '$labels' },
    { $group: { _id: '$labels', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ])
    .toArray()
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw error;
    });
}

module.exports = { mongoInsert, mongoWafGroupBy };
