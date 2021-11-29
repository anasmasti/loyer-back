const express = require('express')
const notification = require('../controllers/notification/notification.js')
const verifyRole = require("../middleware/verify-user-role");

const router = express.Router();


router.route('/notifications/all/:matricule').get(notification.allNotifications("all"));
router.route('/notifications/latest/:matricule').get(notification.latestNotifications);
router.route('/notifications/count/:matricule').get(notification.allNotifications("count"));

module.exports = router;