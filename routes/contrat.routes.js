const express = require('express')
const verifyRole = require("../middleware/verify-user-role");
const postcontrat = require("../controllers/contrat/post.contrat");
const getcontrat = require("../controllers/contrat/get.contrat");
const putcontrat = require("../controllers/contrat/put.contrat");
const deletecontrat = require("../controllers/contrat/delete.contrat");
const upload = require("../middleware/upload");
const router = express.Router();

router.route("/ajouter/:matricule").post(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    { name: "piece_joint_contrat", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie", maxCount: 1 },
    { name: "lettre_res_piece_jointe", maxCount: 1 },
    { name: "piece_jointe_avenant", maxCount: 1 },
  ]),
  postcontrat.ajouterContrat
);
router.route("/tous").get(getcontrat.getContrats);
router.route("/details/:Id").get(getcontrat.getSelctedContrat);
router.route("/caution-en-cours").get(getcontrat.contratCautionEnCours);
router.route("/modifier/:Id").patch(
  upload.fields([
    { name: "piece_joint_contrat", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie", maxCount: 1 },
    { name: "lettre_res_piece_jointe", maxCount: 1 },
    { name: "piece_jointe_avenant", maxCount: 1 },
  ]),
  putcontrat.modifierContrat
);
router.route("/supprimer/:Id/:matricule").put(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    { name: "piece_joint_contrat", maxCount: 1 },
    { name: "images_etat_lieu_sortie", maxCount: 1 },
    { name: "lettre_res_piece_jointe", maxCount: 1 },
    { name: "piece_jointe_avenant", maxCount: 1 },
  ]),
  deletecontrat.supprimerContrat
);
router
  .route("/validation1/:Id/:matricule")
  .put(verifyRole.checkRoles("CDGSP"), putcontrat.modifierValidationDMG);
router
  .route("/validation2/:Id/:matricule")
  .put(verifyRole.checkRoles("DAJC"), putcontrat.modifierValidationDAJC);

module.exports = router;