const express = require('express');

const router = express.Router();
const notiController = require('../controllers/noti-controller');

router.get('/', notiController.getNotifications);

module.exports = router;
