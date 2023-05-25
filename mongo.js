const mongoose = require('mongoose');
const uri = 'mongodb+srv://zmfntpdlxj:xorbgod12@ktgcluster.kbj4v1o.mongodb.net/dashLog'

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const wafSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
});

const Waf = mongoose.model('Waf', wafSchema, 'waf');

const newDocument = new Waf({ timestamp: new Date() });

newDocument.save()
  .then(savedDocument => {
    console.log('문서가 저장되었습니다.');
  })
  .catch(err => {
    console.error(err);
  });