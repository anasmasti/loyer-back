const express = require('express')

const getUser = require("../auth/authentification");

const router = express.Router();

router.route("/").post(getUser.findUser);

module.exports = router;