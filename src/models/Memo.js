const mongoose = require('mongoose');

const memoSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Memo', memoSchema);
