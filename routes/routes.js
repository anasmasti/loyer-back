const express = require('express')
const getProprietaire = require('../controller/proprietaire/get.proprietaire')
const postProprietaire = require('../controller/proprietaire/post.proprietaire')
const putProprietaire = require('../controller/proprietaire/put.proprietaire')
const deleteProprietaire = require('../controller/proprietaire/delete.proprietaire')
const HomeRouter = require('../controller/home/home')

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

module.exports = router;






