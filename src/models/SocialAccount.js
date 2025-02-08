const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['Google', 'Kakao', 'Naver'],
      required: true,
    },
    socialId: { type: String, required: true },
    email: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
  },
  { timestamps: true }
);

socialAccountSchema.index({ provider: 1, socialId: 1 }, { unique: true });

module.exports = socialAccountSchema;
