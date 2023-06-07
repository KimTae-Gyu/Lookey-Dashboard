const express = require('express');
const invokeLambda = require('../aws.js');
const path = require('path');
// 라우팅을 파일 단위로 분리 할 수 있음.

const router = express.Router(); // 라우터 객체 생성

router.get('/nfw', (req, res) => {
    res.sendFile(path.join(__dirname, '../d4_nfwcon.html'));
});

router.post('/nfw', async (req, res) => {
    // payload를 활용해서 NFW 룰그룹 JSON을 생성해야함.
    const payload = {
        Action: req.body.action,
        Header: {
            protocol: req.body.protocol,
            sourcePort: req.body.sourcePort,
            sourceIP: req.body.source,
            direction: req.body.direction,
            destPort: req.body.destPort,
            destIP: req.body.dest
        }
    };
	console.log('payload: ', payload);

    try {
        const flag = await invokeLambda(payload);
        if (flag) {
            res.redirect('/');
        } else {
            res.sendStatus(500);
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.get('/call', async (req, res) => {
    const flag = await invokeLambda();

    try {
        if (flag) {
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router; // 이렇게 라우터를 export 해주면 됨.
