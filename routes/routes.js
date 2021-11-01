const proprietaireRoute = require("./proprietaire.routes");
const userRoute = require("./user.routes");
const lieuxRoute = require("./lieux.routes");
const homeRoute = require("./home.routes");
const chartsRoute = require("./charts.routes");
const sharedRoute = require("./shared.routes");
const contratRoute = require("./contrat.routes");
const downloadFilesRoute = require("./download_files.routes");
const authRoute = require("./auth.routes");

//Home
homeRoute

//Proprietaire
proprietaireRoute

//user Roles
userRoute

//Lieu
lieuxRoute

//contrat
contratRoute

//Shared
sharedRoute

//files download
downloadFilesRoute

//Auth
authRoute


//charts data
chartsRoute

// //role verification

// //test
// const test = require("../controllers/cloture/cloture");

// //Router

// //Home routes


// //Proprietaire routes


// //User Roles


// //Lieu routes


// //contrat routes


// //Shared route


// //download files routes


// //Auth routes


// //countries and cities routes


// //charts routes


// //test
// router.route("/test").post(test.clotureDuMois);

module.exports = router;
