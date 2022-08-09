const express = require("express");
const verifyRole = require("../middleware/verify-user-role");
const postSignaletique = require("../controllers/user-roles/post.roles");
const updateSignaletique = require("../controllers/user-roles/put.roles");
const getSignaletique = require("../controllers/user-roles/get.roles");
const deleteSignaletique = require("../controllers/user-roles/delete.roles");

const router = express.Router();

router
  .route("/signaletique/ajouter/:matricule")
  .post(verifyRole.checkRoles("Admin"), postSignaletique.addSignaletique);
router
  .route("/signaletique/update/:Id/:matricule")
  .put(verifyRole.checkRoles("Admin"), updateSignaletique.updateSignaletique);
router
  .route("/signaletique/all/:matricule")
  .get(verifyRole.checkRoles("Admin"), getSignaletique.getAllSignaletique);
router
  .route("/signaletique/delete/:Id/:matricule")
  .put(verifyRole.checkRoles("Admin"), deleteSignaletique.DeleteSignaletique);

module.exports = router;