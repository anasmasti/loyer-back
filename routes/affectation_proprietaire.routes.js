const express = require("express");

const getAffecttionProprietaire = require("../controllers/affectation_proprietaire/get.affectationproprietaire");
const postAffecttionProprietaire = require("../controllers/affectation_proprietaire/post.affectationproprietaire");
const putAffecttionProprietaire = require("../controllers/affectation_proprietaire/put.affectationproprietaire");
const deleteAffecttionProprietaire = require("../controllers/affectation_proprietaire/delete.affectationproprietaire");
const test = require("../controllers/helpers/proprietaire");
const verifyRole = require("../middleware/verify-user-role");
const router = express.Router();

router
  .route("/affectation-proprietaire/tous/:matricule")
  .get(getAffecttionProprietaire.getAllAffectationsProprietaire);
router
  .route("/affectation-proprietaire/:Id/:matricule")
  .get(getAffecttionProprietaire.getAffectationProprietairePerID);
router
  .route("/affectation-proprietaire/affectations/:Id/:matricule")
  .get(getAffecttionProprietaire.getAPperProprietaireID);
router
  .route("/affectation-proprietaire/ajouter/:IdContrat/:matricule")
  .post(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    postAffecttionProprietaire.postAffectationProprietaire
  );
router
  .route("/affectation-proprietaire/modifier/:Id/:matricule")
  .put(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    putAffecttionProprietaire.putAffectationProprietaire
  );
router
  .route("/affectation-proprietaire/supprimer/:Id/:matricule")
  .put(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    deleteAffecttionProprietaire.deleteAffectationProprietaire
  );
router
  .route("/affectation-proprietaire/libre-proprietaires/:IdContrat/:matricule")
  .get(getAffecttionProprietaire.getProprietairesHasntMondataire);

// router
//   .route("/affectation-proprietaire/test-avance-fanction/:dureeAvance")
//   .post(test.calculAvancePerDuration);

module.exports = router;
