const Comment = require('../models/Comment');

exports.createComment = async (commentData) => {
  try {
    if (commentData.parentId) {
      const isChildComment = await Comment.findById(commentData.parentId);
      if (!isChildComment) {
        throw new Error('Comment does not have a parent comment');
      }
    }

    const comment = new Comment(commentData);
    await comment.save();

    return comment;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during creating comment');
  }
};
