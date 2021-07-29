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
const getLieu = require('../controller/lieu/get.lieu')

//contrat
const postcontrat = require('../controller/contrat/post.contrat')
const getcontrat = require('../controller/contrat/get.contrat')
const putcontrat = require('../controller/contrat/put.contrat')
const deletecontrat = require('../controller/contrat/delete.contrat')

//Router
const router = express.Router()

//Home routes
router.route('/home').get(HomeRouter.getHome);

//Proprietaire routes
router.route('/proprietaire/tous').get(getProprietaire.getAllProprietaire);
router.route('/proprietaire/:Id').get(getProprietaire.getProprietairePerID);
router.route('/proprietaire/count/all').get(getProprietaire.getCountProprietaire);
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

router.route('/lieu/all-lieu').get(getLieu.getAllLieu);
router.route('/lieu/:Id').get(getLieu.getLieuById);
router.route('/lieu/amenagement-byId/:IdLieu/:IdAmng').get(getLieu.getAmenagementById);
router.route('/lieu/amenagement/all-amenagements').get(getLieu.getAllAmenagement);
router.route('/lieu/fournisseur-byId/:IdLieu').get(getLieu.getFournisseursOfLieu);
router.route('/lieu/Dr/Sup').get(getLieu.getAllDirectionsAndSupervions);
router.route('/lieu/count/all').get(getLieu.getCountLieu);


//contrat routes 
router.route('/contrat/ajouter').post(postcontrat.ajouterContrat);
router.route('/contrat/tous').get(getcontrat.getContrats);
router.route('/contrat/modifier/:ID').put(putcontrat.modifierContrat);
router.route('/contrat/supprimer/:ID').put(deletecontrat.supprimerContrat);


module.exports = router;






