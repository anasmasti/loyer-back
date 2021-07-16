const express = require('express')
const upload = require('../middleware/upload')

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
const deleteUserRoles = require('../controller/user-roles/delete.roles')

//Lieu
const postLieu = require('../controller/lieu/post.lieu')
const modifierLieu = require('../controller/lieu/put.lieu')

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

//User Roles 
router.route('/userRoles/ajouter').post(postUserRoles.addUserRoles);
router.route('/userRoles/update/:Id').put(updateUserRoles.updateUserRoles);
router.route('/userRoles/all-userRoles').get(getUserRoles.getAllUserRoles);
router.route('/userRoles/userRoles-PerId/:Id').get(getUserRoles.getUserRolesPerId);
router.route('/userRoles/delete-userRoles/:Id').put(deleteUserRoles.DeleteRoles)

//Lieu routes
router.route('/lieu/ajouter').post(
    upload.fields([
        { name: 'imgs_lieu_entrer', maxCount: 5 },
        { name: 'imgs_amenagement', maxCount: 5 },
        { name: 'imgs_croquis', maxCount: 2 }]),
    postLieu.ajouterLieu);

router.route('/lieu/modifier/:Id').put(
    upload.fields([
        { name: 'imgs_lieu_entrer', maxCount: 5 },
        { name: 'imgs_amenagement', maxCount: 5 },
        { name: 'imgs_croquis', maxCount: 2 }]),
        modifierLieu.modifierLieu)



module.exports = router;






