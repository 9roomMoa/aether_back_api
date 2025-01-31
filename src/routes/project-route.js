const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project-controller');

router.post('/', projectController.createProject);

router.patch('/:pid', projectController.patchProject);

module.exports = router;
