const express = require("express");
const postFoncier = require("../controllers/foncier/post.foncier");
const putFoncier = require("../controllers/foncier/put.foncier");
const getFoncier = require("../controllers/foncier/get.foncier");
const deleteFoncier = require("../controllers/foncier/delete.foncier");
const verifyRole = require("../middleware/verify-user-role");
const upload = require("../middleware/upload");

const router = express.Router();
router.route("/foncier/ajouter/:matricule").post(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    // imgs_lieu_entrer
    { name: "imgs_lieu_entrer1", maxCount: 1 },
    { name: "imgs_lieu_entrer2", maxCount: 1 },
    { name: "imgs_lieu_entrer3", maxCount: 1 },
    { name: "imgs_lieu_entrer4", maxCount: 1 },
    { name: "imgs_lieu_entrer5", maxCount: 1 },
    { name: "imgs_lieu_entrer6", maxCount: 1 },
    { name: "imgs_lieu_entrer7", maxCount: 1 },
    { name: "imgs_lieu_entrer8", maxCount: 1 },

    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
    // // imgs_amenagement
    // { name: "imgs_amenagement1", maxCount: 1 },
    // { name: "imgs_amenagement2", maxCount: 1 },
    // { name: "imgs_amenagement3", maxCount: 1 },
    // { name: "imgs_amenagement4", maxCount: 1 },
    // { name: "imgs_amenagement5", maxCount: 1 },
    // { name: "imgs_amenagement6", maxCount: 1 },
    // { name: "imgs_amenagement7", maxCount: 1 },
    // { name: "imgs_amenagement8", maxCount: 1 },

    // // imgs_croquis
    // { name: "imgs_croquis1", maxCount: 1 },
    // { name: "imgs_croquis2", maxCount: 1 },
    // { name: "imgs_croquis3", maxCount: 1 },
    // { name: "imgs_croquis4", maxCount: 1 },
    // { name: "imgs_croquis5", maxCount: 1 },
    // { name: "imgs_croquis6", maxCount: 1 },
    // { name: "imgs_croquis7", maxCount: 1 },
    // { name: "imgs_croquis8", maxCount: 1 },
  ]),
  postFoncier.ajouterFoncier
);
router.route("/foncier/modifier/:IdFoncier/:matricule").put(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    // imgs_lieu_entrer
    { name: "imgs_lieu_entrer1", maxCount: 1 },
    { name: "imgs_lieu_entrer2", maxCount: 1 },
    { name: "imgs_lieu_entrer3", maxCount: 1 },
    { name: "imgs_lieu_entrer4", maxCount: 1 },
    { name: "imgs_lieu_entrer5", maxCount: 1 },
    { name: "imgs_lieu_entrer6", maxCount: 1 },
    { name: "imgs_lieu_entrer7", maxCount: 1 },
    { name: "imgs_lieu_entrer8", maxCount: 1 },

    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
    // // imgs_amenagement
    // { name: "imgs_amenagement1", maxCount: 1 },
    // { name: "imgs_amenagement2", maxCount: 1 },
    // { name: "imgs_amenagement3", maxCount: 1 },
    // { name: "imgs_amenagement4", maxCount: 1 },
    // { name: "imgs_amenagement5", maxCount: 1 },
    // { name: "imgs_amenagement6", maxCount: 1 },
    // { name: "imgs_amenagement7", maxCount: 1 },
    // { name: "imgs_amenagement8", maxCount: 1 },

    // // imgs_croquis
    // { name: "imgs_croquis1", maxCount: 1 },
    // { name: "imgs_croquis2", maxCount: 1 },
    // { name: "imgs_croquis3", maxCount: 1 },
    // { name: "imgs_croquis4", maxCount: 1 },
    // { name: "imgs_croquis5", maxCount: 1 },
    // { name: "imgs_croquis6", maxCount: 1 },
    // { name: "imgs_croquis7", maxCount: 1 },
    // { name: "imgs_croquis8", maxCount: 1 },
  ]),
  putFoncier.modifierFoncier
);
router
  .route("/foncier/all/:matricule")
  .get(
    // verifyRole.checkRoles("CDGSP", "CSLA"), 
  getFoncier.getAllFoncier);
router
  .route("/foncier/:IdFoncier/:matricule")
  .get(
    // verifyRole.checkRoles("CDGSP", "CSLA"), 
  getFoncier.getFoncierById);
router
  .route("/foncier/supprimer/:IdFoncier/:matricule")
  .put(verifyRole.checkRoles("CDGSP", "CSLA"), deleteFoncier.deleteFoncier);

module.exports = router;
