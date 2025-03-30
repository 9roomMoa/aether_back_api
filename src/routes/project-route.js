const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project-controller');
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/verify-token');
const notiController = require('../controllers/noti-controller');

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

router.get(
  '/:pid/notifications',
  authMiddleware.verifyToken,
  notiController.getNotifications
);

module.exports = router;
