const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['Google', 'KaKkao', 'Naver'],
      required: true,
    },
    socialId: { type: String, required: true },
    email: { type: String },
    accessToken: { type: String },
  },
  { timestamps: true }
);

module.exports = socialAccountSchema;
