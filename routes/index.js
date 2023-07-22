const express = require('express');
const passport = require('passport');
const path = require('path');
// 라우팅을 파일 단위로 분리 할 수 있음.

const router = express.Router(); // 라우터 객체 생성

router.get('/', (req, res) => {
    if(req.isAuthenticated()) {
      //console.log('loggedIn : ' + loggedIn);
      res.sendFile(path.join(__dirname, '../d2_main.html'));
    } else {
       res.redirect('/login');
    }
    //res.render('index', { loggedIn });
});

router.get('/logout', (req, res) => { // logout 도 post로 전환해야할지 고민중.
    console.log('Log Out ' + req.user.id);
    req.logout((err) => {    
        if(err) return next(err);
        res.redirect('/');        
    });    
});

router.get('/location', (req, res) => { // logout 도 post로 전환해야할지 고민중.
    const ipAddress = '219.240.87.167';
  
    const apiUrl = `https://geolite.info/geoip/v2.1/city/${ipAddress}`;
    const username = '867355';
    const password = '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';
    // API 호출
    fetch(apiUrl,{
        headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request failed. Status:', response.status);
        }
      })
      .then(data => {
        res.json(data); // API 응답을 클라이언트에게 전달
      })
      .catch(error => {
        console.error('Request failed:', error.message);
        res.status(500).json({ error: 'Request failed' });
      }); 
});

// router.get('/clearCache', (req, res) => {
//     delete require.cache[require.resolve('./index.js')];
//     res.send('Cache cleared!');
//   });

module.exports = router; // 이렇게 라우터를 export 해주면 됨.