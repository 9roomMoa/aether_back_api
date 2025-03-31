const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task-controller');
const docsController = require('../controllers/docs-controller');
const uploadMiddleware = require('../middlewares/upload');
const commentController = require('../controllers/comment-controller');
const authMiddleware = require('../middlewares/verify-token');

router.post('/', authMiddleware.verifyToken, taskController.createTask);

router.get('/:pid', authMiddleware.verifyToken, taskController.getAllTasks);

router.delete('/:tid', authMiddleware.verifyToken, taskController.deleteTask);

router.get(
  '/:tid/info',
  authMiddleware.verifyToken,
  taskController.getTaskInfo
);

router.patch(
  '/:tid/info',
  authMiddleware.verifyToken,
  taskController.updateTaskInfo
);

router.post(
  '/:tid/comments',
  authMiddleware.verifyToken,
  commentController.createComment
);

router.get(
  '/:tid/comments',
  authMiddleware.verifyToken,
  commentController.getComments
);

router.patch(
  '/:tid/comments/:cid',
  authMiddleware.verifyToken,
  commentController.updateComment
);

router.delete(
  '/:tid/comments',
  authMiddleware.verifyToken,
  commentController.deleteComment
);

router.get(
  '/:tid/comments/search',
  authMiddleware.verifyToken,
  commentController.searchComments
);

router.get(
  '/:tid/managers',
  authMiddleware.verifyToken,
  taskController.getManagerInfo
);

router.post(
  '/:tid/managers',
  authMiddleware.verifyToken,
  taskController.addManagers
);

router.post(
  '/:tid/docs',
  authMiddleware.verifyToken,
  uploadMiddleware.uploadMultiple,
  docsController.postDocument
);

router.get(
  '/:tid/docs',
  authMiddleware.verifyToken,
  docsController.getDocuments
);

router.get(
  '/:tid/docs/search',
  authMiddleware.verifyToken,
  docsController.searchDocuments
);

module.exports = router;
