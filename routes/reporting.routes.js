const amenagementReporting = require("../controllers/reporting/amenagement");
const cautionEnCoursReporting = require("../controllers/reporting/caution.en.cours");
const echeancesContratReporting = require("../controllers/reporting/échéances.contrat");
const locauxFermesReporting = require('../controllers/reporting/locaux.fermés');
const etatSiege = require("../controllers/reporting/etat.loyer.siége");
const etatPV = require("../controllers/reporting/etat.loyer.pv");
const etatLF = require("../controllers/reporting/etat.loyer.lf");
const etatDR = require("../controllers/reporting/etat.loyer.dr");
const etatSupervision = require("../controllers/reporting/etat.loyer.supervision");
const getReporting = require('../controllers/reporting/get.reporting')

const express = require("express");
const router = express.Router();

router
  .route("/generate/amenagement")
  .get(amenagementReporting.amenagementReporting);
router
  .route("/generate/contrat/caution-en-coure")
  .get(cautionEnCoursReporting.cautionEnCoursReporting);
router
  .route("/generate/contrat/echeances")
  .get(echeancesContratReporting.echeancesContratReporting);
router
  .route("/generate/locaux-fermes")
  .get(locauxFermesReporting.locauxFermesReporting);
router
  .route("/generate/Siege")
  .get(etatSiege.etatLoyerSiege);
router
  .route("/generate/DR")
  .get(etatDR.etatLoyerDR);
router
  .route("/generate/LF")
  .get(etatLF.etatLoyerLF);
router
  .route("/generate/PV")
  .get(etatPV.etatLoyerPV);
router
  .route("/generate/SV")
  .get(etatSupervision.etatLoyerSupervision);
router
  .route("/reporting/all")
  .post(getReporting.allReporting)

module.exports = router;
