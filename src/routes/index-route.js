const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index-controller');
const authMiddleware = require('../middlewares/verify-token');

router.get('/home', authMiddleware.verifyToken, indexController.getLandingPage);

module.exports = router;
