const express = require("express");
const verifyRole = require("../middleware/verify-user-role");
const postSignaletique = require("../controllers/signaletique/post.signaletique");
const updateSignaletique = require("../controllers/signaletique/put.signaletique");
const getSignaletiques = require("../controllers/signaletique/get.signaletique");
const deleteSignaletique = require("../controllers/signaletique/delete.signaletique");

const router = express.Router();

router
  .route("/signaletique/ajouter/:matricule")
  .post(verifyRole.checkRoles("Admin"), postSignaletique);
router
  .route("/signaletique/update/:Id/:matricule")
  .put(verifyRole.checkRoles("Admin"), updateSignaletique);
router
  .route("/signaletique/all/:matricule")
  .get(verifyRole.checkRoles("Admin"), getSignaletiques);
router
  .route("/signaletique/delete/:Id/:matricule")
  .put(verifyRole.checkRoles("Admin"), deleteSignaletique);

module.exports = router;