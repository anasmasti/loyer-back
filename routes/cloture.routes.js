const express = require('express')
const Cloture = require('../controllers/cloture/cloture')
const verifyRole = require("../middleware/verify-user-role");

const router = express.Router();

router
.route("/cloture/:matricule")
.post( verifyRole.checkRoles("DC"), Cloture.clotureDuMois);
router
.route("/next-cloture")
.get(Cloture.getClotureDate)


module.exports = router;