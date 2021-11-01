const express = require('express')

const getProprietaireAndLieu = require("../controllers/shared/get.proprietaire.lieu");
const countAll = require("../controllers/shared/get.countAll");
const putContrat = require("../controllers/contrat/put.contrat");
const getAllCountries = require("../controllers/pays_cities/get.pays");
const getCitiesByCountry = require("../controllers/pays_cities/get.villesByPays");

const router = express.Router();

router
  .route("/proprietaire-lieu")
  .get(getProprietaireAndLieu.getProprietaireAndLieu);
router.route("/count-all").get(countAll.countAll);
router.route("/countries").get(getAllCountries.listOfCountries);
router.route("/cities").get(getCitiesByCountry.getCities);

module.exports = router;