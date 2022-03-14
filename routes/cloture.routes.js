const express = require("express");
const Cloture = require("../controllers/cloture/cloture");
const verifyRole = require("../middleware/verify-user-role");
const situationCloture = require("../controllers/situation_cloture/index");
const etat_virement = require("../controllers/situation_cloture/etat_virement");
const etat_taxes = require("../controllers/situation_cloture/etat_taxes");
const allpaths = require("../controllers/situation_cloture/all_paths");

const router = express.Router();

router
  .route("/cloture/:matricule")
  .post(verifyRole.checkRoles("DC"), Cloture.clotureDuMois);
router.route("/next-cloture").get(Cloture.getClotureDate);

router
  .route("/situation-cloture/:matricule")
  .post(verifyRole.checkRoles("DC"), situationCloture.situation_cloture);
// router
//   .route("/generate/etat-virement/:matricule")
//   .post(verifyRole.checkRoles("CSLA"), etat_virement.etatMonsuelVirement);
// router
//   .route("/generate/etat-taxes/:matricule")
//   .post(verifyRole.checkRoles("CSLA"), etat_taxes.etatMonsuelTaxes);
router
  .route("/all-etats/:mois/:annee")
  .post(allpaths.allEtats);

module.exports = router;
