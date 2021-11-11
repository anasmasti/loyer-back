const express = require('express')
const testClotureMois = require('../controllers/cloture/cloture')

const router = express.Router();

router
.route("/cloture-mois")
.post(testClotureMois.clotureDuMois);
router
.route("/next-cloture")
.get(testClotureMois.getClotureDate)


module.exports = router;