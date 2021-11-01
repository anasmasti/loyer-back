
const express = require('express')
const verifyRole = require("../middleware/verify-user-role");
const postLieu = require("../controllers/lieu/post.lieu");
const modifierLieu = require("../controllers/lieu/put.lieu");
const getLieu = require("../controllers/lieu/get.lieu");
const deleteLieu = require("../controllers/lieu/delete.lieu");
const upload = require("../middleware/upload");
const router = express.Router();

router.route("/lieu/ajouter/:matricule").post(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    { name: "imgs_lieu_entrer", maxCount: 5 },
    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
  ]),
  postLieu.ajouterLieu
);

router.route("/lieu/modifier/:Id/:matricule").patch(
  verifyRole.checkRoles("CDGSP", "CSLA"),
  upload.fields([
    { name: "imgs_lieu_entrer", maxCount: 5 },
    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
  ]),
  modifierLieu.modifierLieu
);

router
  .route("/lieu/all-lieu/:matricule")
  .get(verifyRole.checkRoles("CDGSP", "CSLA"), getLieu.getAllLieu);
router
  .route("/lieu/lieu-by-id/:Id:matricule")
  .get(verifyRole.checkRoles("CDGSP", "CSLA"), getLieu.getLieuById);
router
  .route("/lieu/Dr/Sup/:matricule")
  .get(
    verifyRole.checkRoles("CDGSP", "CSLA"),
    getLieu.getAllDirectionsAndSupervions
  );
router
  .route("/lieu/count/all/:matricule")
  .get(verifyRole.checkRoles("CDGSP", "CSLA"), getLieu.getCountLieu);
router
  .route("/lieu/detail/:Id/:matricule")
  .get(verifyRole.checkRoles("CDGSP", "CSLA"), getLieu.detailLieu);
router
  .route("/lieu/delete/:Id/:matricule")
  .patch(verifyRole.checkRoles("CDGSP", "CSLA"), deleteLieu.deletedLieu);
router
  .route("/lieu/contratByLieu/:Id/:matricule")
  .get(verifyRole.checkRoles("CDGSP", "CSLA"), getLieu.getContratByLieu);

module.exports = router;