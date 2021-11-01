const express = require('express')

const getProprietaire = require("../controllers/proprietaire/get.proprietaire");
const postProprietaire = require("../controllers/proprietaire/post.proprietaire");
const putProprietaire = require("../controllers/proprietaire/put.proprietaire");
const deleteProprietaire = require("../controllers/proprietaire/delete.proprietaire");
const verifyRole = require("../middleware/verify-user-role");
const router = express.Router();

router
  .route("/tous/:matricule")
  .get(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    getProprietaire.getAllProprietaire
  );
router
  .route("/:Id/:matricule")
  .get(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    getProprietaire.getProprietairePerID
  );
router
  .route("/count/all")
  .get(getProprietaire.getCountProprietaire);
router
  .route("/ajouter/:Id_lieu/:matricule")
  .post(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    postProprietaire.postProprietaire
  );
router
  .route("/modifier/:Id/:matricule")
  .put(verifyRole.checkRoles("CDGSP", "CSLA"), putProprietaire.putProprietaire);
router
  .route("/supprimer/:Id/:matricule")
  .put(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    deleteProprietaire.deleteProprietaire
  );

module.exports = router;