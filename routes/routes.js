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
const deleteLieu = require('../controller/lieu/delete.lieu')
//contrat
const postcontrat = require('../controller/contrat/post.contrat')
const getcontrat = require('../controller/contrat/get.contrat')
const putcontrat = require('../controller/contrat/put.contrat')
const deletecontrat = require('../controller/contrat/delete.contrat')

//Foncier 
const postFoncier = require('../controller/foncier/post.foncier')
const putFoncier = require('../controller/foncier/put.foncier')
const getFoncier = require('../controller/foncier/get.foncier')
const deleteFoncier = require('../controller/foncier/delete.foncier')

//Shared
const getProprietaireAndLieu = require('../controller/shared/get.proprietaire.lieu')

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
router.route('/user/ajouter').post(postUserRoles.addUserRoles);
router.route('/user/update/:Id').put(updateUserRoles.updateUserRoles);
router.route('/user/all').get(getUserRoles.getAllUserRoles);
router.route('/user/detail/:Id').get(getUserRoles.getUserRolesPerId);
router.route('/user/delete/:Id').put(deleteUserRoles.DeleteRoles)

//Lieu routes
router.route('/lieu/ajouter').post(
    upload.fields([
        { name: 'imgs_lieu_entrer', maxCount: 5 },
        { name: 'imgs_amenagement', maxCount: 5 },
        { name: 'imgs_croquis', maxCount: 2 }]),
    postLieu.ajouterLieu);

router.route('/lieu/modifier/:Id').patch(
    upload.fields([
        { name: 'imgs_lieu_entrer', maxCount: 5 },
        { name: 'imgs_amenagement', maxCount: 5 },
        { name: 'imgs_croquis', maxCount: 2 }]),
    modifierLieu.modifierLieu)



router.route('/lieu/all-lieu').get(getLieu.getAllLieu);
router.route('/lieu/lieu-by-id/:Id').get(getLieu.getLieuById);
router.route('/lieu/Dr/Sup').get(getLieu.getAllDirectionsAndSupervions);
router.route('/lieu/count/all').get(getLieu.getCountLieu);
router.route('/lieu/delete/:Id').patch(deleteLieu.deletedLieu)



//contrat routes 
router.route('/contrat/ajouter').post(
    upload.fields([
        { name: 'piece_joint_contrat', maxCount: 1 },
        { name: 'images_etat_lieu_sortie', maxCount: 1 },
        { name: 'lettre_res_piece_jointe', maxCount: 1 },
        { name: 'piece_jointe_avenant', maxCount: 1 },
    ]),
    postcontrat.ajouterContrat);
router.route('/contrat/tous').get(getcontrat.getContrats);
router.route('/contrat/details/:ID').get(getcontrat.getSelctedContrat);
router.route('/contrat/modifier/:ID').put(
    upload.fields([
        { name: 'piece_joint_contrat', maxCount: 1 },
        { name: 'images_etat_lieu_sortie', maxCount: 1 },
        { name: 'lettre_res_piece_jointe', maxCount: 1 },
        { name: 'piece_jointe_avenant', maxCount: 1 },
    ]), putcontrat.modifierContrat);
router.route('/contrat/supprimer/:ID').put(
    upload.fields([
        { name: 'piece_joint_contrat', maxCount: 1 },
        { name: 'images_etat_lieu_sortie', maxCount: 1 },
        { name: 'lettre_res_piece_jointe', maxCount: 1 },
        { name: 'piece_jointe_avenant', maxCount: 1 },
    ]), deletecontrat.supprimerContrat);

//Foncier routes
router.route('/foncier/ajouter').post(postFoncier.postFoncier) 
router.route('/foncier/modifier/:Id').patch(putFoncier.putFoncier)
router.route('/foncier/all').get(getFoncier.allFoncier)
router.route('/foncier/:Id').get(getFoncier.foncierById)
router.route('/foncier/delete/:Id').patch(deleteFoncier.deleteFoncier)

//Shared route
router.route('/proprietaire-lieu').get(getProprietaireAndLieu.getProprietaireAndLieu)


//TESTS




module.exports = router;






