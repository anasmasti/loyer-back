const express = require('express')

const getAnnex1 = require("../controllers/maquette_tele_declaration_paiement/maquette.teledeclaration");
const getAnnex2 = require("../controllers/maquette_tele_declaration_paiement/maquette.telepaiement");
const getFichierComptableLoyer = require("../controllers/comptabilisation/comtabilisationLoyer");
const getFichierComptableCaution = require("../controllers/comptabilisation/comptabilisationCautions");
const getFichierOrdreVirement = require("../controllers/virement/ordreVirement")


const router = express.Router();

router.route("/annex1/:mois/:annee").get(getAnnex1.createAnnex1);
router.route("/annex2/:mois/:annee").get(getAnnex2.createAnnex2);
router
  .route("/fichier-comptable-loyer/:mois/:annee")
  .get(getFichierComptableLoyer.genererComptabilisationLoyer);
router
  .route("/fichier-comptable-caution/:mois/:annee")
  .get(getFichierComptableCaution.genererComptabilisationCautions);
router
  .route("/fichier-ordre-virement/:mois/:annee")
  .get(getFichierOrdreVirement.genererOrdreVirement)
module.exports = router;