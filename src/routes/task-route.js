const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task-controller');

router.post('/', taskController.createTask);

router.get('/', taskController.getAllTasks);

router.delete('/', taskController.deleteTask);

router.get('/:tid/info', taskController.getTaskInfo);

router.post('/:tid/comments', taskController.createComment);

router.get('/:tid/comments', taskController.getComments);

router.delete('/:tid/comments', taskController.deleteComment);

router.get('/:tid/comments/search', taskController.searchComments);

router.get('/:tid/managers', taskController.getManagerInfo);

router.post('/:tid/managers', taskController.addManagers);

module.exports = router;
