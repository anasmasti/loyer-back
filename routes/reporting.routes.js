const amenagementReporting = require("../controllers/reporting/amenagement");
const cautionEnCoursReporting = require("../controllers/reporting/caution.en.cours");
const echeancesContratReporting = require("../controllers/reporting/échéances.contrat");
const locauxFermesReporting = require('../controllers/reporting/locaux.fermés');
const etatSiege = require("../controllers/reporting/etat.loyer.siége");
const etatPV = require("../controllers/reporting/etat.loyer.pv");
const etatLF = require("../controllers/reporting/etat.loyer.lf");
const etatDR = require("../controllers/reporting/etat.loyer.dr");
const etatSupervision = require("../controllers/reporting/etat.loyer.supervision");

const express = require("express");
const router = express.Router();

router
  .route("/generate/amenagement")
  .get(amenagementReporting.amenagementReporting);
router
  .route("/generate/caution-en-coure")
  .get(cautionEnCoursReporting.cautionEnCoursReporting);
router
  .route("/generate/contrat")
  .get(echeancesContratReporting.echeancesContratReporting);
router
  .route("/generate/locaux-fermes")
  .get(locauxFermesReporting.locauxFermesReporting);
router
  .route("/generate/siege")
  .get(etatSiege.etatLoyerSiege);
router
  .route("/generate/dr")
  .get(etatDR.etatLoyerDR);
router
  .route("/generate/lf")
  .get(etatLF.etatLoyerLF);
router
  .route("/generate/pv")
  .get(etatPV.etatLoyerPV);
router
  .route("/generate/supervision")
  .get(etatSupervision.etatLoyerSupervision);

module.exports = router;
