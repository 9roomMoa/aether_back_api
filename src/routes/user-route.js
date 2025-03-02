const express = require('express');

const router = express.Router();
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/verify-token');

router.get(
  '/search',
  authMiddleware.verifyToken,
  userController.getUserInfoByKeyword
);

module.exports = router;
