const express = require("express");
const Cloture = require("../controllers/cloture/cloture");
const verifyRole = require("../middleware/verify-user-role");

const router = express.Router();

router
  .route("/cloture/:matricule")
  .post(verifyRole.checkRoles("DC"), Cloture.clotureDuMois);
router.route("/next-cloture").get(Cloture.getClotureDate);

module.exports = router;

// {
//     "ordeVirementLoyer": {
//         "ordre_virement": [
//             {
//                 "type_enregistrement": "0602",
//                 "cin": "BB981273",
//                 "passport": "",
//                 "carte_sejour": "",
//                 "nom_prenom": "Youssef Tawfiq",
//                 "numero_compte_bancaire": "112938937129836479271111",
//                 "mois": 2,
//                 "annee": 2022,
//                 "nom_agence_bancaire": "CIH TST",
//                 "montant_net": 327250
//             },
//             {
//                 "type_enregistrement": "0602",
//                 "cin": "BB102938",
//                 "passport": "",
//                 "carte_sejour": "",
//                 "nom_prenom": "Samir Sefsafi",
//                 "numero_compte_bancaire": "119332983632324323438909",
//                 "mois": 2,
//                 "annee": 2022,
//                 "nom_agence_bancaire": "BMCI TST",
//                 "montant_net": 81000
//             }
//         ],
//         "_id": "6218d6fa8552e53494a2e764",
//         "date_generation_de_virement": "2022-03-01T00:00:00.000Z",
//         "mois": 2,
//         "annee": 2022
//     },
//     "comptabilisationArchive": {
//         "comptabilisation_loyer_crediter": [
//             {
//                 "nom_de_piece": "2022-03-01T00:00:00.000Z",
//                 "date_gl": "2022-03-01T00:00:00.000Z",
//                 "date_operation": "2022-03-01T00:00:00.000Z",
//                 "cin": "BB981273",
//                 "passport": "",
//                 "carte_sejour": "",
//                 "type": "LOY",
//                 "adresse_proprietaire": "RABAT",
//                 "adresse_lieu": "rabat agdal",
//                 "origine": "PAISOFT",
//                 "devises": "MAD",
//                 "intitule_lieu": "DR rabat",
//                 "code_lieu": "001",
//                 "etablissement": "01",
//                 "centre_de_cout": "NS",
//                 "direction_regional": "001",
//                 "point_de_vente": "",
//                 "montant_net": 250250,
//                 "montant_tax": 9750,
//                 "montant_caution": 195000,
//                 "montant_brut": 260000,
//                 "date_comptabilisation": "2022-02-01T00:00:00.000Z"
//             },
//             {
//                 "nom_de_piece": "2022-03-01T00:00:00.000Z",
//                 "date_gl": "2022-03-01T00:00:00.000Z",
//                 "date_operation": "2022-03-01T00:00:00.000Z",
//                 "cin": "BJ162837",
//                 "passport": "",
//                 "carte_sejour": "",
//                 "type": "LOY",
//                 "adresse_proprietaire": "RABAT",
//                 "adresse_lieu": "rabat agdal",
//                 "origine": "PAISOFT",
//                 "devises": "MAD",
//                 "intitule_lieu": "DR rabat",
//                 "code_lieu": "001",
//                 "etablissement": "01",
//                 "centre_de_cout": "NS",
//                 "direction_regional": "001",
//                 "point_de_vente": "",
//                 "montant_net": 308750,
//                 "montant_tax": 11250,
//                 "montant_caution": 45000,
//                 "montant_brut": 320000,
//                 "date_comptabilisation": "2022-02-01T00:00:00.000Z"
//             },
//             {
//                 "nom_de_piece": "2022-03-01T00:00:00.000Z",
//                 "date_gl": "2022-03-01T00:00:00.000Z",
//                 "date_operation": "2022-03-01T00:00:00.000Z",
//                 "cin": "BJ12345",
//                 "passport": "",
//                 "carte_sejour": "",
//                 "type": "LOY",
//                 "adresse_proprietaire": "RABAT",
//                 "adresse_lieu": "rabat agdal",
//                 "origine": "PAISOFT",
//                 "devises": "MAD",
//                 "intitule_lieu": "DR rabat",
//                 "code_lieu": "001",
//                 "etablissement": "01",
//                 "centre_de_cout": "NS",
//                 "direction_regional": "001",
//                 "point_de_vente": "",
//                 "montant_net": 327250,
//                 "montant_tax": 12750,
//                 "montant_caution": 60000,
//                 "montant_brut": 340000,
//                 "date_comptabilisation": "2022-02-01T00:00:00.000Z"
//             },
//             {
//                 "nom_de_piece": "2022-03-01T00:00:00.000Z",
//                 "date_gl": "2022-03-01T00:00:00.000Z",
//                 "date_operation": "2022-03-01T00:00:00.000Z",
//                 "cin": "BB102938",
//                 "passport": "",
//                 "carte_sejour": "",
//                 "type": "LOY",
//                 "adresse_proprietaire": "CASABLANCA MAARIF",
//                 "adresse_lieu": "Casablanca maarif",
//                 "origine": "PAISOFT",
//                 "devises": "MAD",
//                 "intitule_lieu": "PV rabat",
//                 "code_lieu": "003",
//                 "etablissement": "01",
//                 "centre_de_cout": "NS",
//                 "direction_regional": "001",
//                 "point_de_vente": "003",
//                 "montant_net": 32400,
//                 "montant_tax": 3600,
//                 "montant_caution": 12000,
//                 "montant_brut": 36000,
//                 "date_comptabilisation": "2022-02-01T00:00:00.000Z"
//             },
//             {
//                 "nom_de_piece": "2022-03-01T00:00:00.000Z",
//                 "date_gl": "2022-03-01T00:00:00.000Z",
//                 "date_operation": "2022-03-01T00:00:00.000Z",
//                 "cin": "BJ12320",
//                 "passport": "",
//                 "carte_sejour": "",
//                 "type": "LOY",
//                 "adresse_proprietaire": "MAARIF CASABLANCA",
//                 "adresse_lieu": "Casablanca maarif",
//                 "origine": "PAISOFT",
//                 "devises": "MAD",
//                 "intitule_lieu": "PV rabat",
//                 "code_lieu": "003",
//                 "etablissement": "01",
//                 "centre_de_cout": "NS",
//                 "direction_regional": "001",
//                 "point_de_vente": "003",
//                 "montant_net": 81000,
//                 "montant_tax": 9000,
//                 "montant_caution": 18000,
//                 "montant_brut": 90000,
//                 "date_comptabilisation": "2022-02-01T00:00:00.000Z"
//             }
//         ],
//         "comptabilisation_loyer_debiter": [
//             {
//                 "intitule_lieu": "DR rabat",
//                 "montant_caution": 300000,
//                 "numero_contrat": "001/DR rabat",
//                 "direction_regional": "001",
//                 "point_de_vente": "",
//                 "montant": 400000
//             },
//             {
//                 "intitule_lieu": "PV rabat",
//                 "montant_caution": 30000,
//                 "numero_contrat": "003/PV rabat",
//                 "direction_regional": "001",
//                 "point_de_vente": "003",
//                 "montant": 90000
//             }
//         ],
//         "_id": "6218d6fa8552e53494a2e765",
//         "date_generation_de_comptabilisation": "2022-03-01T00:00:00.000Z",
//         "mois": 2,
//         "annee": 2022
//     }
// }
