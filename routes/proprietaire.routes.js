const express = require("express");
const getProprietaire = require("../controllers/proprietaire/get.proprietaire");
const postProprietaire = require("../controllers/proprietaire/post.proprietaire");
const putProprietaire = require("../controllers/proprietaire/put.proprietaire");
const deleteProprietaire = require("../controllers/proprietaire/delete.proprietaire");
const verifyRole = require("../middleware/verify-user-role");
const router = express.Router();

router
  .route("/proprietaire/tous/:matricule")
  .get(getProprietaire.getAllProprietaire);
router
  .route("/proprietaire/:Id/:matricule")
  .get(getProprietaire.getProprietairePerID);
router
  .route("/proprietaire/ajouter/:matricule")
  .post(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    postProprietaire.postProprietaire
  );
router
  .route("/proprietaire/modifier/:Id/:matricule")
  .put(verifyRole.checkRoles("CDGSP", "CSLA"), putProprietaire.putProprietaire);
router
  .route("/proprietaire/supprimer/:Id/:matricule")
  .put(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    deleteProprietaire.deleteProprietaire
  );
router
  .route("/proprietaire/count/all")
  .get(getProprietaire.getCountProprietaire);
router
  .route("/proprietaire/lieu/foncier-by-proprietaire/:Id/:matricule")
  .get(getProprietaire.getIdFoncierByProprietaire);

module.exports = router;
