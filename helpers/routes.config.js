const express = require('express')
const getProprietaire = require('../routes/proprietaire/get.proprietaire')
const postProprietaire = require('../routes/proprietaire/post.proprietaire')
const putProprietaire = require('../routes/proprietaire/put.proprietaire')
const deleteProprietaire = require('../routes/proprietaire/delete.proprietaire')
const HomeRouter = require('../routes/home/home')

const router = express.Router()

//Home routes
router.route('/home').get(HomeRouter.getHome);

//Proprietaire routes
router.route('/tous').get(getProprietaire.GetAllProprietaire);
router.route('/propietaire/:Id').get(getProprietaire.GetProprietairePerID);
router.route('/ajouter').post(postProprietaire.PostProprietaire);
router.route('/modifer/:Id').put(putProprietaire.PutProprietaire);
router.route('/supprimer/:Id').put(deleteProprietaire.DeleteProprietaire);



module.exports = router;






