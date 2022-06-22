const express = require("express");
const getProprietaire = require("../controllers/helpers/shared/cloture_helper");

const router = express.Router();

router.route("/test").get(getProprietaire.generateNextDateComptabilisation);

module.exports = router;
