const Memo = require('../models/Memo');

exports.createMemo = async (userId, data) => {
  try {
    const memo = await Memo.create({
      description: data.description,
      createdBy: userId,
    });
    return memo;
  } catch (err) {
    throw err;
  }
};
