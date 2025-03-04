const express = require('express');
const router = express.Router();

const memoController = require('../controllers/memo-controller.js');
const authMiddleware = require('../middlewares/verify-token.js');

router.post('/', authMiddleware.verifyToken, memoController.createMemo);

router.get('/', authMiddleware.verifyToken, memoController.getMemo);

module.exports = router;
