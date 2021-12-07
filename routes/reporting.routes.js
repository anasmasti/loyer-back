const amenagementReporting = require("../controllers/reporting/amenagement");
const cautionEnCoursReporting = require("../controllers/reporting/caution.en.cours");
const echeancesContratReporting = require("../controllers/reporting/échéances.contrat");
const etatSiege = require("../controllers/reporting/etat.loyer.siége");
const etatPV = require("../controllers/reporting/etat.loyer.pv");
const etatLF = require("../controllers/reporting/etat.loyer.lf");
const etatDR = require("../controllers/reporting/etat.loyer.dr");
const etatSupervision = require("../controllers/reporting/etat.loyer.supervision");

const express = require("express");
const router = express.Router();

router
  .route("/amenagement-reporting")
  .get(amenagementReporting.amenagementReporting);
router
  .route("/caution-en-coure-reporting")
  .get(cautionEnCoursReporting.cautionEnCoursReporting);
router
  .route("/echeance-contrat-reporting")
  .get(echeancesContratReporting.echeancesContratReporting);
router.route("/etat-loyer-siege").get(etatSiege.etatLoyerSiege);
router.route("/etat-loyer-dr").get(etatDR.etatLoyerDR);
router.route("/etat-loyer-lf").get(etatLF.etatLoyerLF);
router.route("/etat-loyer-pv").get(etatPV.etatLoyerPV);
router
  .route("/etat-loyer-supervision")
  .get(etatSupervision.etatLoyerSupervision);

module.exports = router;
