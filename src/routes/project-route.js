const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project-controller');
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/verify-token');

router.post('/', authMiddleware.verifyToken, projectController.createProject);

router.patch(
  '/:pid',
  authMiddleware.verifyToken,
  projectController.patchProject
);

router.get(
  '/:pid/members',
  authMiddleware.verifyToken,
  userController.getUserInfoByKeyword
);

module.exports = router;
