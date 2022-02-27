const express = require("express");
const Cloture = require("../controllers/cloture/cloture");
const verifyRole = require("../middleware/verify-user-role");
const situationCloture = require("../controllers/situation_cloture/index");
const etat_virement = require("../controllers/situation_cloture/etat_virement");

const router = express.Router();

router
  .route("/cloture/:matricule")
  .post(verifyRole.checkRoles("DC"), Cloture.clotureDuMois);
router.route("/next-cloture").get(Cloture.getClotureDate);

router
  .route("/situation-cloture/:matricule")
  .post(verifyRole.checkRoles("CSLA"), situationCloture.situation_cloture);
router
  .route("/generate/etat-virement/:matricule")
  .post(verifyRole.checkRoles("CSLA"), etat_virement.etatMonsuelVirement);

module.exports = router;
