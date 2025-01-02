const express = require('express');
const session = require('express-session');

const indexRouter = require('./src/routes/index-route');

const app = express();

const PORT = process.env.PORT || 3000;

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use('/', indexRouter);

// 디버깅용 세션 확인 엔드포인트
if (process.env.NODE_ENV !== 'production') {
  app.get('/session', (req, res) => {
    console.log('세션 데이터:', req.session);
    res.send(req.session);
  });
}

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 에러 발생!' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
