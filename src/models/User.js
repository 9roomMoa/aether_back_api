const mongoose = require('mongoose');
const socialAccountSchema = require('./SocialAccount');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // 이메일 형식 유효성 검사
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: { type: String, select: false },
    isSocial: { type: Boolean, default: false },
    socialAccounts: {
      type: [socialAccountSchema],
      validate: {
        validator: function (value) {
          const uniqueAccounts = new Set(
            value.map((v) => {
              `${v.provider}-${v.socialId}`;
            })
          );
          return uniqueAccounts.size === value.length;
        },
      },
    },
    role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
    rank: {
      type: String,
      enum: [
        'Intern',
        'Junior',
        'Mid',
        'Senior',
        'Lead',
        'Manager',
        'Director',
        'VP',
        'CEO',
      ], // 직급 정의
      default: 'Junior', // 기본값 설정
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
