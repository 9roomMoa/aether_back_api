const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task-controller');
const commentController = require('../controllers/comment-controller');

router.post('/', taskController.createTask);

router.get('/', taskController.getAllTasks);

router.delete('/', taskController.deleteTask);

router.get('/:tid/info', taskController.getTaskInfo);

router.post('/:tid/comment', commentController.createComment);

module.exports = router;
