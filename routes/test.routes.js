const express = require("express");
const testFunction = require("../helpers/mail.send");

const router = express.Router();

router.route("/test").get(testFunction.sendMail);

module.exports = router;
