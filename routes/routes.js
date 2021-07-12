const express = require('express')

//Home
const HomeRouter = require('../controller/home/home')

//Proprietaire
const getProprietaire = require('../controller/proprietaire/get.proprietaire')
const postProprietaire = require('../controller/proprietaire/post.proprietaire')
const putProprietaire = require('../controller/proprietaire/put.proprietaire')
const deleteProprietaire = require('../controller/proprietaire/delete.proprietaire')

//user Roles
const postUserRoles = require('../controller/user-roles/post.roles')
const updateUserRoles = require('../controller/user-roles/put.roles')
const getUserRoles = require('../controller/user-roles/get.roles')

//Router
const router = express.Router()

//Home routes
router.route('/home').get(HomeRouter.getHome);

//Proprietaire routes
router.route('/proprietaire/tous').get(getProprietaire.getAllProprietaire);
router.route('/proprietaire/:Id').get(getProprietaire.getProprietairePerID);
router.route('/proprietaire/ajouter').post(postProprietaire.postProprietaire);
router.route('/proprietaire/modifier/:Id').put(putProprietaire.putProprietaire);
router.route('/proprietaire/supprimer/:Id').put(deleteProprietaire.deleteProprietaire);

// Aménagements routes

//User Roles 
router.route('/userRoles/ajouter').post(postUserRoles.addUserRoles);
router.route('/userRoles/update/:Id').put(updateUserRoles.updateUserRoles);
router.route('/userRoles/all-userRoles').get(getUserRoles.getAllUserRoles);
router.route('/userRoles/userRoles-PerId/:Id').get(getUserRoles.getUserRolesPerId);

module.exports = router;






