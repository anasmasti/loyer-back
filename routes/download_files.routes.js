const express = require('express')

const getAnnex1 = require("../controllers/maquette_tele_declaration_paiement/maquette.teledeclaration");
const getAnnex2 = require("../controllers/maquette_tele_declaration_paiement/maquette.telepaiement");
const getFichierComptableLoyer = require("../controllers/comptabilisation/comtabilisationLoyer");
const getFichierComptableCaution = require("../controllers/comptabilisation/comptabilisationCautions");
const testClotureMois = require('../controllers/cloture/cloture')

const router = express.Router();

router.route("/annex1").get(getAnnex1.createAnnex1);
router.route("/annex2").get(getAnnex2.createAnnex2);
router
  .route("/fichier-comptable-loyer")
  .get(getFichierComptableLoyer.setComptabilisationLoyer);
router
  .route("/fichier-comptable-caution")
  .get(getFichierComptableCaution.setComptabilisationCautions);
router
  .route("/test-cloture")
  .post(testClotureMois.clotureDuMois);
router
  .route("/next-cloture")
  .get(testClotureMois.getClotureDate)
module.exports = router;