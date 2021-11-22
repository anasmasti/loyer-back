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
    { name: "imgs_lieu_entrer", maxCount: 5 },
    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
  ]),
  postFoncier.ajouterFoncier
);
router.route("/foncier/modifier/:IdFoncier/:matricule").put(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    { name: "imgs_lieu_entrer", maxCount: 5 },
    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
  ]),
  putFoncier.modifierFoncier
);
router
  .route("/foncier/all/:matricule")
  .get(verifyRole.checkRoles("CDGSP", "CSLA"), getFoncier.getAllFoncier);
router
  .route("/foncier/detail/:IdFoncier/:matricule")
  .get(verifyRole.checkRoles("CDGSP", "CSLA"), getFoncier.getFoncierById);
router
  .route("/foncier/supprimer/:IdFoncier/:matricule")
  .put(verifyRole.checkRoles("CDGSP", "CSLA"), deleteFoncier.deleteFoncier);

module.exports = router;
