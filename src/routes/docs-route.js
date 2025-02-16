const express = require('express');

const router = express.Router();
const docsController = require('../controllers/docs-controller');
const authMiddleware = require('../middlewares/verify-token');

router.get(
  '/downloads/:did',
  authMiddleware.verifyToken,
  docsController.downloadDocument
);

module.exports = router;
