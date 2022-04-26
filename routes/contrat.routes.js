const express = require("express");
const verifyRole = require("../middleware/verify-user-role");
const postcontrat = require("../controllers/contrat/post.contrat");
const getcontrat = require("../controllers/contrat/get.contrat");
const putcontrat = require("../controllers/contrat/put.contrat");
const ContratHelper = require("../controllers/helpers/contrat");
const deletecontrat = require("../controllers/contrat/delete.contrat");
const upload = require("../middleware/upload");
const router = express.Router();

router.route("/contrat/ajouter/:IdFoncier/:matricule").post(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    { name: "piece_joint_contrat1", maxCount: 1 },
    { name: "piece_joint_contrat2", maxCount: 1 },
    { name: "piece_joint_contrat3", maxCount: 1 },
    { name: "piece_joint_contrat4", maxCount: 1 },
    { name: "piece_joint_contrat5", maxCount: 1 },
    { name: "piece_joint_contrat6", maxCount: 1 },
    { name: "piece_joint_contrat7", maxCount: 1 },
    { name: "piece_joint_contrat8", maxCount: 1 },

    // images_etat_res_lieu_sortie
    { name: "images_etat_res_lieu_sortie1", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie2", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie3", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie4", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie5", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie6", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie7", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie8", maxCount: 1 },

    // lettre_res_piece_jointe
    { name: "lettre_res_piece_jointe1", maxCount: 1 },
    { name: "lettre_res_piece_jointe2", maxCount: 1 },
    { name: "lettre_res_piece_jointe3", maxCount: 1 },
    { name: "lettre_res_piece_jointe4", maxCount: 1 },
    { name: "lettre_res_piece_jointe5", maxCount: 1 },
    { name: "lettre_res_piece_jointe6", maxCount: 1 },
    { name: "lettre_res_piece_jointe7", maxCount: 1 },
    { name: "lettre_res_piece_jointe8", maxCount: 1 },

    // piece_jointe_avenant
    { name: "piece_jointe_avenant1", maxCount: 1 },
    { name: "piece_jointe_avenant2", maxCount: 1 },
    { name: "piece_jointe_avenant3", maxCount: 1 },
    { name: "piece_jointe_avenant4", maxCount: 1 },
    { name: "piece_jointe_avenant5", maxCount: 1 },
    { name: "piece_jointe_avenant6", maxCount: 1 },
    { name: "piece_jointe_avenant7", maxCount: 1 },
    { name: "piece_jointe_avenant8", maxCount: 1 },
  ]),
  postcontrat.ajouterContrat
);
router.route("/contrat/tous").get(getcontrat.getAllContrats);
router.route("/contrat/details/:Id").get(getcontrat.getDetailContrat);
router.route("/contrat/modifier/:Id").patch(
  upload.fields([
    { name: "piece_joint_contrat1", maxCount: 1 },
    { name: "piece_joint_contrat2", maxCount: 1 },
    { name: "piece_joint_contrat3", maxCount: 1 },
    { name: "piece_joint_contrat4", maxCount: 1 },
    { name: "piece_joint_contrat5", maxCount: 1 },
    { name: "piece_joint_contrat6", maxCount: 1 },
    { name: "piece_joint_contrat7", maxCount: 1 },
    { name: "piece_joint_contrat8", maxCount: 1 },

    // images_etat_res_lieu_sortie
    { name: "images_etat_res_lieu_sortie1", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie2", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie3", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie4", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie5", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie6", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie7", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie8", maxCount: 1 },

    // lettre_res_piece_jointe
    { name: "lettre_res_piece_jointe1", maxCount: 1 },
    { name: "lettre_res_piece_jointe2", maxCount: 1 },
    { name: "lettre_res_piece_jointe3", maxCount: 1 },
    { name: "lettre_res_piece_jointe4", maxCount: 1 },
    { name: "lettre_res_piece_jointe5", maxCount: 1 },
    { name: "lettre_res_piece_jointe6", maxCount: 1 },
    { name: "lettre_res_piece_jointe7", maxCount: 1 },
    { name: "lettre_res_piece_jointe8", maxCount: 1 },

    // piece_jointe_avenant
    { name: "piece_jointe_avenant1", maxCount: 1 },
    { name: "piece_jointe_avenant2", maxCount: 1 },
    { name: "piece_jointe_avenant3", maxCount: 1 },
    { name: "piece_jointe_avenant4", maxCount: 1 },
    { name: "piece_jointe_avenant5", maxCount: 1 },
    { name: "piece_jointe_avenant6", maxCount: 1 },
    { name: "piece_jointe_avenant7", maxCount: 1 },
    { name: "piece_jointe_avenant8", maxCount: 1 },
  ]),
  putcontrat.modifierContrat
);
router.route("/contrat/supprimer/:Id/:matricule").put(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    { name: "piece_joint_contrat1", maxCount: 1 },
    { name: "piece_joint_contrat2", maxCount: 1 },
    { name: "piece_joint_contrat3", maxCount: 1 },
    { name: "piece_joint_contrat4", maxCount: 1 },
    { name: "piece_joint_contrat5", maxCount: 1 },
    { name: "piece_joint_contrat6", maxCount: 1 },
    { name: "piece_joint_contrat7", maxCount: 1 },
    { name: "piece_joint_contrat8", maxCount: 1 },

    // images_etat_res_lieu_sortie
    { name: "images_etat_res_lieu_sortie1", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie2", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie3", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie4", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie5", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie6", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie7", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie8", maxCount: 1 },

    // lettre_res_piece_jointe
    { name: "lettre_res_piece_jointe1", maxCount: 1 },
    { name: "lettre_res_piece_jointe2", maxCount: 1 },
    { name: "lettre_res_piece_jointe3", maxCount: 1 },
    { name: "lettre_res_piece_jointe4", maxCount: 1 },
    { name: "lettre_res_piece_jointe5", maxCount: 1 },
    { name: "lettre_res_piece_jointe6", maxCount: 1 },
    { name: "lettre_res_piece_jointe7", maxCount: 1 },
    { name: "lettre_res_piece_jointe8", maxCount: 1 },

    // piece_jointe_avenant
    { name: "piece_jointe_avenant1", maxCount: 1 },
    { name: "piece_jointe_avenant2", maxCount: 1 },
    { name: "piece_jointe_avenant3", maxCount: 1 },
    { name: "piece_jointe_avenant4", maxCount: 1 },
    { name: "piece_jointe_avenant5", maxCount: 1 },
    { name: "piece_jointe_avenant6", maxCount: 1 },
    { name: "piece_jointe_avenant7", maxCount: 1 },
    { name: "piece_jointe_avenant8", maxCount: 1 },
  ]),
  deletecontrat.supprimerContrat
);
router
  .route("/contrat/validation1/:Id/:matricule")
  .put(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    putcontrat.modifierValidationDMG
  );
router
  .route("/contrat/validation2/:Id/:matricule")
  .put(verifyRole.checkRoles("DAJC"), putcontrat.modifierValidationDAJC);
// putcontrat.modifierValidationDAJC);
router
  .route("/contrat/soumettre/:Id/:matricule")
  .put(verifyRole.checkRoles("CSLA", "CDGSP"), putcontrat.soumettre);
router
  .route("/contrat/annuler-contrat/:Id/:matricule")
  .put(
    verifyRole.checkRoles("CSLA", "DAJC", "CDGSP"),
    putcontrat.annulerContrat
  );
module.exports = router;
