const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task-controller');

router.post('/', taskController.createTask);

router.get('/', taskController.getAllTasks);

router.get('/:tid/info', taskController.getTaskInfo);

router.get('/', taskController.getAllTasks);

module.exports = router;
