const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
  await mongoose
    .connect(dbURI, {
      dbName: 'aether',
    })
    .then(() => {
      console.log('mongodb connected');
    })
    .catch((err) => {
      console.error('mongodb connection error', err);
    });
};

mongoose.connection.on('error', (error) => {
  console.error('몽고디비 연결 에러', error);
});

mongoose.connection.on('disconnected', () => {
  console.error('몽고디비 연결이 끊어졌습니다. 연결을 재시도 합니다');
  connectDB();
});

module.exports = connectDB;
