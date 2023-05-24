const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = (connection) => {
    const userInfoQuery = "SELECT * FROM dash_user WHERE user_id = ?"; // 쿼리도 감춰야할 필요가 있을수도 있다.

    passport.serializeUser((user, done) => { // strategy 성공 시 호출
        console.log('serial', user);
        done(null, user.id); // user.id가 deserializeUser의 첫 번째 매개 변수
    });
    
    passport.deserializeUser((user_id, done) => { // user_id는 serial..의 done의 user.id
        // # 세션에 담긴 req.user의 정보를 데이터베이스에 저장된 정보와 일치하는지 계속하여 검증하는 코드가 들어가야 함
        console.log('deserial', user_id);
        connection.query(userInfoQuery, [user_id], (err, res, fields) => {
            if(err) console.log(err);
            if(res[0] != undefined) done(null, user_id); // 이 user가 req.user가 됨.
        });        
    });
    
    // DB에 회원 ID, Pwd 일치 여부 검증
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password',
        session: true
    }, (id, password, done) => {        
        connection.query(userInfoQuery, [id], (err, res, fields) => {
            if(err) console.log(err);
            // id로 조회했을 때 결과가 나옴 => 비밀번호 검증, 결과가 없다 => 아이디 틀림            
            if(res[0] != undefined) {
                // 결과는 res[0]에 객체로 담겨있음.
                // 비밀 번호 틀리면 error
                if( password !== res[0].user_password ) {
                    // console.log('res : ' + JSON.stringify(res));
                    // console.log('password : ' + password + ' res.user_password : ' + res[0].user_password);
                    // console.log('비밀번호가 일치하지 않습니다.');
                    done(null, false, { message: '비밀번호가 틀렸습니다.' });
                } else {
                    // 비밀 번호까지 맞으면 로그인 성공
                    const user = { id: res[0].user_id, password: res[0].user_password };
                    done(null, user);
                }                
            } else {
                console.log('ID가 일치하지 않습니다.');
                done(null, false, { message: 'ID가 틀렸습니다.' });
            }
        });    

        //connection.end();

        // if(id === data.id) {
        //     if(password === data.password){
        //         done(null, data);
        //     } else {
        //         done(null, false, { message: '비밀번호가 틀렸습니다.' });
        //     }
        // } else {
        //     done(null, false, { message: 'ID가 틀렸습니다.' });
        // }
    }));
}