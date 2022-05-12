const express = require("express");
const verifyRole = require("../middleware/verify-user-role");
const postLieu = require("../controllers/lieu/post.lieu");
const modifierLieu = require("../controllers/lieu/put.lieu");
const getLieu = require("../controllers/lieu/get.lieu");
const deleteLieu = require("../controllers/lieu/delete.lieu");
const router = express.Router();

router
  .route("/lieu/ajouter/:matricule")
  .post(verifyRole.checkRoles("DAJC","CDGSP", "CSLA"), postLieu.ajouterLieu);

router
  .route("/lieu/modifier/:Id/:matricule")
  .patch(verifyRole.checkRoles("DAJC","CDGSP", "CSLA"), modifierLieu.modifierLieu);

router
  .route("/lieu/all-lieu/:matricule")
  .get(
    // verifyRole.checkRoles("CDGSP", "CSLA"), 
    getLieu.getAllLieu);
router
  .route("/lieu/lieu-by-id/:Id/:matricule")
  .get(
    // verifyRole.checkRoles("CDGSP", "CSLA"), 
    getLieu.getLieuById);
router
  .route("/lieu/Dr/Sup/:matricule")
  .get(
    getLieu.getAllDirectionsAndSupervions
  );
router
  .route("/lieu/count/all/:matricule")
  .get(verifyRole.checkRoles("CDGSP", "CSLA"), getLieu.getCountLieu);
router
  .route("/lieu/detail/:Id/:matricule")
  .get(
    // verifyRole.checkRoles("CDGSP", "CSLA"), 
  getLieu.getLieuById);
router
  .route("/lieu/delete/:Id/:matricule")
  .patch(verifyRole.checkRoles("CDGSP", "CSLA"), deleteLieu.deletedLieu);
// router
//   .route("/lieu/contratByLieu/:Id/:matricule")
//   .get(
//     // verifyRole.checkRoles("CDGSP", "CSLA"), 
//     getLieu.getContratByLieu);
router
  .route("/lieu/lieu-by-type/:matricule")
  .post(
    getLieu.getLieuByType);

module.exports = router;
