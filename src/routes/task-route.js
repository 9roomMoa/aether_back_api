const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task-controller');
const docsController = require('../controllers/docs-controller');
const uploadMiddleware = require('../middlewares/upload');

router.post('/', taskController.createTask);

router.get('/', taskController.getAllTasks);

router.delete('/', taskController.deleteTask);

router.get('/:tid/info', taskController.getTaskInfo);

router.patch('/:tid/info', taskController.updateTaskInfo);

router.post('/:tid/comments', taskController.createComment);

router.get('/:tid/comments', taskController.getComments);

router.patch('/:tid/comments/:cid', taskController.updateComment);

router.delete('/:tid/comments', taskController.deleteComment);

router.get('/:tid/comments/search', taskController.searchComments);

router.get('/:tid/managers', taskController.getManagerInfo);

router.post('/:tid/managers', taskController.addManagers);

router.post(
  '/:tid/docs',
  uploadMiddleware.uploadSingle,
  docsController.postDocument
);

router.get('/:tid/docs', docsController.getDocuments);

router.get('/:tid/docs/search', docsController.searchDocuments);

module.exports = router;
