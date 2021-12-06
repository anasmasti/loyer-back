const amenagementReporting = require('../controllers/reporting/amenagement')
const cautionEnCoursReporting = require('../controllers/reporting/caution.en.cours')
const echeancesContratReporting = require('../controllers/reporting/échéances.contrat')

const express = require('express')
const router = express.Router()


router.route('/amenagement-reporting').get(amenagementReporting.amenagementReporting)
router.route('/caution-en-coure-reporting').get(cautionEnCoursReporting.cautionEnCoursReporting)
router.route('/echeance-contrat-reporting').get(echeancesContratReporting.echeancesContratReporting)



module.exports = router;
