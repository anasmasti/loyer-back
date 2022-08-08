const express = require('express')

const getUser = require("../auth/authentification");

const router = express.Router();

router.route("/auth").post(getUser.findUser);
router.route("/auth/update-password/:Id").put(getUser.updatePassword);

module.exports = router;