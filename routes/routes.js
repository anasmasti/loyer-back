const express = require("express");
const upload = require("../middleware/upload");

//Home
const HomeRouter = require("../controller/home/home");

//Proprietaire
const getProprietaire = require("../controller/proprietaire/get.proprietaire");
const postProprietaire = require("../controller/proprietaire/post.proprietaire");
const putProprietaire = require("../controller/proprietaire/put.proprietaire");
const deleteProprietaire = require("../controller/proprietaire/delete.proprietaire");

//user Roles
const postUserRoles = require("../controller/user-roles/post.roles");
const updateUserRoles = require("../controller/user-roles/put.roles");
const getUserRoles = require("../controller/user-roles/get.roles");
const deleteUserRoles = require("../controller/user-roles/delete.roles");

//Lieu
const postLieu = require("../controller/lieu/post.lieu");
const modifierLieu = require("../controller/lieu/put.lieu");
const getLieu = require("../controller/lieu/get.lieu");
const deleteLieu = require("../controller/lieu/delete.lieu");
//contrat
const postcontrat = require("../controller/contrat/post.contrat");
const getcontrat = require("../controller/contrat/get.contrat");
const putcontrat = require("../controller/contrat/put.contrat");
const deletecontrat = require("../controller/contrat/delete.contrat");

//Foncier
const postFoncier = require("../controller/foncier/post.foncier");
const putFoncier = require("../controller/foncier/put.foncier");
const getFoncier = require("../controller/foncier/get.foncier");
const deleteFoncier = require("../controller/foncier/delete.foncier");

//Shared
const getProprietaireAndLieu = require("../controller/shared/get.proprietaire.lieu");
const countAll = require("../controller/shared/get.countAll");
const putContrat = require("../controller/contrat/put.contrat");

//files download
const getAnnex1 = require("../controller/maquette Tele declaration-paiement/maquette.teledeclaration");
const getAnnex2 = require("../controller/maquette Tele declaration-paiement/maquette.telepaiement");
const getFichierComptableLoyer = require("../controller/comptabilisation/comtabilisationLoyer");
const getFichierComptableCaution = require("../controller/comptabilisation/comptabilisationCautions");

//Auth
const getUser = require("../auth/authentification");

//coutries and cites
const getAllCountries = require("../controller/pays et villes/get.pays");
const getCitiesByCountry = require("../controller/pays et villes/get.villesByPays");

//Router
const router = express.Router();

//Home routes
router.route("/home").get(HomeRouter.getHome);

//Proprietaire routes
router.route("/proprietaire/tous").get(getProprietaire.getAllProprietaire);
router.route("/proprietaire/:Id").get(getProprietaire.getProprietairePerID);
router
  .route("/proprietaire/count/all")
  .get(getProprietaire.getCountProprietaire);
router.route("/proprietaire/ajouter").post(postProprietaire.postProprietaire);
router.route("/proprietaire/modifier/:Id").put(putProprietaire.putProprietaire);
router
  .route("/proprietaire/supprimer/:Id")
  .put(deleteProprietaire.deleteProprietaire);

//User Roles
router.route("/user/ajouter").post(postUserRoles.addUserRoles);
router.route("/user/update/:Id").put(updateUserRoles.updateUserRoles);
router.route("/user/all").get(getUserRoles.getAllUserRoles);
router.route("/user/detail/:Id").get(getUserRoles.getUserRolesPerId);
router.route("/user/delete/:Id").put(deleteUserRoles.DeleteRoles);

//Lieu routes
router.route("/lieu/ajouter").post(
  upload.fields([
    { name: "imgs_lieu_entrer", maxCount: 5 },
    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
  ]),
  postLieu.ajouterLieu
);

router.route("/lieu/modifier/:Id").patch(
  upload.fields([
    { name: "imgs_lieu_entrer", maxCount: 5 },
    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
  ]),
  modifierLieu.modifierLieu
);

router.route("/lieu/all-lieu").get(getLieu.getAllLieu);
router.route("/lieu/lieu-by-id/:Id").get(getLieu.getLieuById);
router.route("/lieu/Dr/Sup").get(getLieu.getAllDirectionsAndSupervions);
router.route("/lieu/count/all").get(getLieu.getCountLieu);
router.route("/lieu/detail/:Id").get(getLieu.detailLieu);
router.route("/lieu/delete/:Id").patch(deleteLieu.deletedLieu);

//contrat routes
router.route("/contrat/ajouter").post(
  upload.fields([
    { name: "piece_joint_contrat", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie", maxCount: 1 },
    { name: "lettre_res_piece_jointe", maxCount: 1 },
    { name: "piece_jointe_avenant", maxCount: 1 },
  ]),
  postcontrat.ajouterContrat
);
router.route("/contrat/tous").get(getcontrat.getContrats);
router.route("/contrat/details/:Id").get(getcontrat.getSelctedContrat);
router.route("/contrat/modifier/:Id").patch(
  upload.fields([
    { name: "piece_joint_contrat", maxCount: 1 },
    { name: "images_etat_res_lieu_sortie", maxCount: 1 },
    { name: "lettre_res_piece_jointe", maxCount: 1 },
    { name: "piece_jointe_avenant", maxCount: 1 },
  ]),
  putcontrat.modifierContrat
);
router.route("/contrat/supprimer/:Id").put(
  upload.fields([
    { name: "piece_joint_contrat", maxCount: 1 },
    { name: "images_etat_lieu_sortie", maxCount: 1 },
    { name: "lettre_res_piece_jointe", maxCount: 1 },
    { name: "piece_jointe_avenant", maxCount: 1 },
  ]),
  deletecontrat.supprimerContrat
);
router.route("/contrat/validation1/:Id").put(putContrat.modifierValidationDMG);
router.route("/contrat/validation2/:Id").put(putContrat.modifierValidationDAJC);

//Foncier routes
router.route("/foncier/ajouter").post(postFoncier.postFoncier);
router.route("/foncier/modifier/:Id").patch(putFoncier.putFoncier);
router.route("/foncier/all").get(getFoncier.allFoncier);
router.route("/foncier/:Id").get(getFoncier.foncierById);
router.route("/foncier/delete/:Id").patch(deleteFoncier.deleteFoncier);

//Shared route
router
  .route("/proprietaire-lieu")
  .get(getProprietaireAndLieu.getProprietaireAndLieu);
router.route("/count-all").get(countAll.countAll);

//download files routes
router.route("/annex1").get(getAnnex1.createAnnex1);
router.route("/annex2").get(getAnnex2.createAnnex2);
router
  .route("/fichier-comptable-loyer")
  .get(getFichierComptableLoyer.setComptabilisationLoyer);
router
  .route("/fichier-comptable-caution")
  .get(getFichierComptableCaution.setComptabilisationCautions);

//Auth routes
router.route("/auth").get(getUser.findUser);

//countries and cities routes
router.route("/countries").get(getAllCountries.listOfCountries);
router.route("/cities/:isoCode").get(getCitiesByCountry.getCitiesByCountry);

//TESTS

module.exports = router;
