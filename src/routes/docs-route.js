const express = require('express');

const router = express.Router();
const docsController = require('../controllers/docs-controller');

router.get('/downloads/:did', docsController.downloadDocument);

module.exports = router;
