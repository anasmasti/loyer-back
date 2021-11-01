const express = require('express')

const HomeRouter = require("../controllers/home/home");

const router = express.Router();

router.route("/").get(HomeRouter.getHome);

module.exports = router;