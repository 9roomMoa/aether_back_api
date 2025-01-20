const mongoose = require('mongoose');
const socialAccountSchema = require('./SocialAccount');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isSocial: { type: Boolean, default: false },
    socialAccounts: [socialAccountSchema],
    role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
