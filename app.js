const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { connectDB } = require('.//config/database');
const { StatusCodes } = require('http-status-codes');
const Eureka = require('eureka-js-client').Eureka;

const indexRouter = require('./src/routes/index-route');
const taskRouter = require('./src/routes/task-route');
const projectRouter = require('./src/routes/project-route');
const docsRouter = require('./src/routes/docs-route');

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);

// 보안 관련 미들웨어 및 로깅 설정 (production 환경에 따른 설정)
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(morgan('combined')); // 생산 환경에서는 'combined'로 로깅
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );
} else {
  app.use(morgan('dev')); // 개발 환경에서는 'dev'로 로깅
}

const allowedOrigin = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',')
  : ['http://localhost:3000'];

// CORS 설정
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // production 환경에서는 secure 속성 설정
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 세션 만료 시간 설정 (1시간)
    },
  })
);

const client = new Eureka({
  instance: {
    app: process.env.EUREKA_APP_NAME, // 서비스 이름
    hostName: process.env.HOST_NAME, // 호스트명
    ipAddr: process.env.IP, // IP 주소
    port: {
      $: process.env.EUREKA_PORT_NUMBER, // 서비스 포트 (고정)
      '@enabled': true,
    },
    vipAddress: process.env.EUREKA_VIP_ADDRESS,
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: process.env.EUREKA_HOST, // 유레카 서버 IP
    port: process.env.EUREKA_PORT, // 유레카 서버 포트
    servicePath: '/eureka/apps/',
    fetchRegistry: true,
    registerWithEureka: true,
  },
  requestMiddleware: (requestOpts, done) => {
    requestOpts.auth = {
      user: process.env.EUREKA_USER,
      password: process.env.EUREKA_PASSWORD,
    };
    done(requestOpts);
  },
});

// ✅ Eureka 등록 시작
client.start((error) => {
  if (error) {
    console.error('❌ Eureka 등록 실패:', error);
  } else {
    console.log('✅ Eureka 등록 성공!');
  }
});

app.use('/', indexRouter); // 라우팅 처리

app.use('/api/tasks', taskRouter);

app.use('/api/projects', projectRouter);

app.use('/api/docs', docsRouter);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: '서버 에러 발생!' });
});

connectDB();

// 서버 시작
app.listen(app.get('port'), () => {
  console.log(`Server running on http://localhost:${app.get('port')}`);
});
