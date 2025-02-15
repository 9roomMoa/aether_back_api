const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project-controller');
const authMiddleware = require('../middlewares/verify-token');

router.post('/', authMiddleware.verifyToken, projectController.createProject);

router.patch(
  '/:pid',
  authMiddleware.verifyToken,
  projectController.patchProject
);

module.exports = router;
