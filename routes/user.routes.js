const express = require("express");
const verifyRole = require("../middleware/verify-user-role");
const postUserRoles = require("../controllers/user-roles/post.roles");
const updateUserRoles = require("../controllers/user-roles/put.roles");
const getUserRoles = require("../controllers/user-roles/get.roles");
const deleteUserRoles = require("../controllers/user-roles/delete.roles");

const router = express.Router();

router
  .route("/user/ajouter/:matricule")
  .post(verifyRole.checkRoles("Admin"), postUserRoles.addUserRoles);
router
  .route("/user/update/:Id/:matricule")
  .put(verifyRole.checkRoles("Admin"), updateUserRoles.updateUserRoles);
router
  .route("/user/all/:matricule")
  .get(verifyRole.checkRoles("Admin"), getUserRoles.getAllUserRoles);
router
  .route("/user/detail/:Id/:matricule")
  .get(verifyRole.checkRoles("Admin"), getUserRoles.getUserRolesPerId);
router
  .route("/user/delete/:Id/:matricule")
  .put(verifyRole.checkRoles("Admin"), deleteUserRoles.DeleteRoles);

module.exports = router;
