const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { GridFSBucket } = require('mongodb');

const Task = require('../src/models/Task'); // Task 모델 import
const Project = require('../src/models/Project'); // Project 모델 import
const User = require('../src/models/User'); // User 모델 import

dotenv.config();

const dbURI = process.env.MONGO_URI;

// MongoDB 연결 함수
const connectDB = async () => {
  try {
    // 환경 변수에서 MongoDB URI 가져오기
    const mongoURI = dbURI;

    // MongoDB 연결
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'aether',
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully!');

    const bucket = new GridFSBucket(conn.connection.db, {
      bucketName: 'documents',
    });

    console.log('GridFSBucket initialized!');
    return bucket;

    // 초기 데이터 삽입
    // await seedDatabase();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // 연결 실패 시 프로세스 종료
  }
};

// 초기 데이터 삽입 함수
const seedDatabase = async () => {
  try {
    console.log('Seeding initial data...');

    // 예제 User 생성
    const user = await User.create({
      name: '조윤영',
      email: 'dbsdud@gmail.com',
      password: 'passwd1234@',
    });

    // 예제 Project 생성
    // await Project.create({
    //   name: 'Test Project',
    //   description: 'This is a test project',
    //   createdBy: user._id,
    // });

    // 예제 Task 생성
    // await Task.create({
    //   title: 'Test Task4',
    //   description: 'This is a test task for checking scope',
    //   status: 'To Do',
    //   priority: 3,
    //   project: '678e1623945330ce231d7fcb',
    //   assignedTo: '678e1623945330ce231d7fc9',
    //   createdBy: '6790968a79bfefbffcfa362d',
    //   startDate: new Date(),
    //   dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
    // });

    console.log('Initial data seeded successfully!');
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
};

mongoose.connection.on('error', (error) => {
  console.error('몽고디비 연결 에러', error);
});

mongoose.connection.on('disconnected', () => {
  console.error('몽고디비 연결이 끊어졌습니다. 연결을 재시도 합니다');
  connectDB();
});

module.exports = { connectDB, mongoose };
