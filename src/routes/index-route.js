const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index-controller');
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/verify-token');

router.get('/home', authMiddleware.verifyToken, indexController.getLandingPage);

router.get(
  '/members',
  authMiddleware.verifyToken,
  userController.getAllUserInfoByKeyword
);

module.exports = router;
