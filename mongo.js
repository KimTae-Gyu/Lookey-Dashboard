const dotenv = require('dotenv');
// const { MongoClient } = require('mongodb');
dotenv.config();
const uri = process.env.MONGO_URI;

function wafMongoInsert(connection, logs) {
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

function nfwMongoInsert(connection, logs) {
  // 컬렉션 이름
  const collectionName = 'nfw';
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
  const collectionName = 'wafs2';
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

function mongoNfwGroupBy(connection) {
  // 컬렉션 이름
  const collectionName = 'nfw3';
  const collection = connection.collection(collectionName);

  return collection.aggregate([
    {
      $match: {
        "event.src_ip": {
          $not: {
            $regex: "^10\\.|^172\\.(1[6-9]|2[0-9]|3[0-1])\\.|^192\\.168\\."
          }
        }
      }
    },
    {
      $group: {
        _id: "$event.src_ip",
        count: { $sum: 1 },
        timestamps: { $push: "$event_timestamp" }
      }
    },  
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    },
	  {
		  $unwind: "$timestamps"
	  },
	  {
		  $sort: { timestamps: -1 }
	  },
	  {
		  $group: {
			  _id: "$_id",
			  count: { $first: "$count" },
			  timestamps: { $push: "$timestamps" }
		  }
	  },
    {
      $project: {
      	_id: 1,
        count: 1,
        timestamps: 1
      }
    }
  ])
    .toArray()
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw error;
    });
}

module.exports = { wafMongoInsert, nfwMongoInsert, mongoWafGroupBy, mongoNfwGroupBy };
