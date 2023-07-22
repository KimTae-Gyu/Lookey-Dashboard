const express = require('express');
const passport = require('passport');
const path = require('path');
// 라우팅을 파일 단위로 분리 할 수 있음.

const router = express.Router(); // 라우터 객체 생성

router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../d1_login.html'));
});

module.exports = router; // 이렇게 라우터를 export 해주면 됨.