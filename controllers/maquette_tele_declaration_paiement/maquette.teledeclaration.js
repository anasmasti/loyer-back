// const xml2js = require("xml2js");
// const fs = require("fs");
// const archivecomptabilisation = require("../../models/archive/archiveComptabilisation.schema");
// const archivevirements = require("../../models/archive/archiveVirement.schema");
// const Contrat = require("../../models/contrat/contrat.model");
// const Test = require("../../controllers/contrat/get.contrat");

// // Today's Date
// let currentDate = new Date();
// let currentYear = currentDate.getFullYear();
// let currentMonth = currentDate.getMonth() + 1;

// function CreateAnnex1ObjectFromArchvCompt(
//   archivecomptabilisation,
//   annee,
//   mois
// ) {
//   let DetailRetenueRevFoncier = [];
//   let TotalMntBrutLoyer = 0;
//   let TotalMntRetenueSource = 0;
//   let TotalMntLoyer = 0;

//   for (
//     let i = 0;
//     i < archivecomptabilisation.comptabilisation_loyer_crediter.length;
//     i++
//   ) {
//     if (
//       archivecomptabilisation.comptabilisation_loyer_crediter[i]
//         .declaration_option == "non"
//     ) {
//       //Get Total Montant Brut/RS/Aprés l'impot
//       TotalMntBrutLoyer +=
//         archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_brut;
//       TotalMntRetenueSource +=
//         archivecomptabilisation.comptabilisation_loyer_crediter[i]
//           .retenue_source || 0;
//       TotalMntLoyer +=
//         archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_net;
//       //List DetailRetenueRevFoncier
//       if (
//         archivecomptabilisation.comptabilisation_loyer_crediter[i]
//           .retenue_source > 0
//       ) {
//         DetailRetenueRevFoncier.push({
//           ifuBailleur: `IF${i + 1}`,
//           numCNIBailleur:
//             archivecomptabilisation.comptabilisation_loyer_crediter[i].cin,
//           numCEBailleur:
//             archivecomptabilisation.comptabilisation_loyer_crediter[i]
//               .carte_sejour,
//           nomPrenomBailleur:
//             archivecomptabilisation.comptabilisation_loyer_crediter[i]
//               .nom_prenom,
//           adresseBailleur:
//             archivecomptabilisation.comptabilisation_loyer_crediter[i]
//               .adresse_proprietaire,
//           adresseBien:
//             archivecomptabilisation.comptabilisation_loyer_crediter[i]
//               .adresse_lieu,
//           typeBienBailleur: {
//             code: "LUC",
//           },
//           mntBrutLoyer:
//             archivecomptabilisation.comptabilisation_loyer_crediter[
//               i
//             ].montant_brut.toFixed(2),
//           mntRetenueSource:
//             archivecomptabilisation.comptabilisation_loyer_crediter[
//               i
//             ].retenue_source.toFixed(2),
//           mntNetLoyer:
//             archivecomptabilisation.comptabilisation_loyer_crediter[
//               i
//             ].montant_net.toFixed(2),
//           tauxRetenueRevFoncier: {
//             code: "TSR.10.2018",
//           },
//         });
//       }
//     }
//   }
//   // Annex 1
//   return {
//     VersementRASRF: {
//       $: {
//         "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
//         "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
//       },
//       identifiantFiscal: "IF",
//       exerciceFiscalDu: annee + "-" + "01" + "-" + "01",
//       exerciceFiscalAu: annee + "-" + 12 + "-" + 31,
//       annee: annee,
//       mois: mois,
//       totalMntBrutLoyer: TotalMntBrutLoyer.toFixed(2),
//       totalMntRetenueSource: TotalMntRetenueSource.toFixed(2),
//       totalMntNetLoyer: TotalMntLoyer.toFixed(2),
//       listDetailRetenueRevFoncier: {
//         DetailRetenueRevFoncier,
//       },
//     },
//   };
// }

// module.exports = {
//   createAnnex1: async (req, res) => {
//     let Annex1;
//     let CurrentMonthContrats = [];
//     let CompareDate;
//     let check = false;

//     archivecomptabilisation
//       .findOne({ mois: req.params.mois, annee: req.params.annee })
//       .sort({ updatedAt: "desc" })
//       .then(async (data) => {
//         // return res.json(data);
//         if (data) {
//           Annex1 = await CreateAnnex1ObjectFromArchvCompt(
//             data,
//             req.params.annee,
//             req.params.mois
//           );

//           // Get the alphabetical month
//           let date = new Date(
//             req.params.annee + " / " + req.params.mois + " / 1"
//           );

//           const AlphabeticalMonth = date.toLocaleString("default", {
//             month: "short",
//           });

//           // Download the xml file
//           var builder = new xml2js.Builder();
//           var xml = builder.buildObject(Annex1);

//           fs.writeFile(
//             `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${req.params.annee}.xml`,
//             xml,
//             (error) => {
//               if (error) {
//                 res.status(403).json({ message: error.message });
//               } else {
//                 res.download(
//                   `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${req.params.annee}.xml`
//                 );
//               }
//             }
//           );
//         }
//       })
//       .catch((error) => {
//         res.status(403).json({ message: error.message });
//       });
//   },
// };

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

const xml2js = require("xml2js");
const fs = require("fs");
const archivecomptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const archivevirements = require("../../models/archive/archiveVirement.schema");
const helper = require("../helpers/maquette_tele_declaration_paiement");

module.exports = {
  createAnnex1: async (req, res) => {
    let ArchCmptbList;
    let index = 0;
    let DetailRetenueRevFoncier = [];
    let TotalMntBrutLoyer = 0;
    let TotalMntRetenueSource = 0;
    let TotalMntLoyer = 0;
    let proprietaireList = [];

    // Current Date
    // let currentDate = new Date();
    let currentYear = req.params.annee;
    let currentMonth = req.params.mois;

    function calculProprietaireMnts(ArchCmptbList, cinProprietaire) {
      let mntBrutTotal = 0;
      let mntRetenueSourceTotal = 0;
      let mntNetLoyerTotal = 0;
      ArchCmptbList.forEach((ArchCmptb) => {
        ArchCmptb.comptabilisation_loyer_crediter.forEach(
          (comptabilisationloyer) => {
            if (comptabilisationloyer.cin == cinProprietaire) {
              mntBrutTotal += comptabilisationloyer.montant_brut;
              mntRetenueSourceTotal += comptabilisationloyer.montant_tax;
              mntNetLoyerTotal += comptabilisationloyer.montant_net;
            }
          }
        );
      });
      // TotalMntBrutLoyer += mntBrutTotal;
      // TotalMntRetenueSource += mntRetenueSourceTotal;
      // TotalMntLoyer += mntNetLoyerTotal;
      proprietaireList.push(cinProprietaire);
      return {
        mntBrutTotal: mntBrutTotal,
        mntRetenueSourceTotal: mntRetenueSourceTotal,
        mntNetLoyerTotal: mntNetLoyerTotal,
      };
    }

    // Get the (archivecomptabilisation) data and put it in ArchCmptb variable
    archivecomptabilisation
      .find({ mois: req.params.mois, annee: req.params.annee })
      .then(async (data) => {
        // return res.json(data)
        if (data.length > 0) {
          ArchCmptbList = data;
          // Filter object by object
          for (let i = 0; i < ArchCmptbList.length; i++) {
            for (
              let j = 0;
              j < ArchCmptbList[i].comptabilisation_loyer_crediter.length;
              j++
            ) {
              if (
                !proprietaireList.includes(
                  ArchCmptbList[i].comptabilisation_loyer_crediter[j].cin
                )
              ) {
                if (
                  ArchCmptbList[i].comptabilisation_loyer_crediter[j]
                    .declaration_option == "non"
                ) {
                  let proprietaireMnts = await calculProprietaireMnts(
                    ArchCmptbList,
                    ArchCmptbList[i].comptabilisation_loyer_crediter[j].cin
                  );

                  //List DetailRetenueRevFoncier
                  if (proprietaireMnts.mntRetenueSourceTotal > 0) {
                    TotalMntBrutLoyer += proprietaireMnts.mntBrutTotal;
                    TotalMntRetenueSource +=
                      proprietaireMnts.mntRetenueSourceTotal;
                    TotalMntLoyer += proprietaireMnts.mntNetLoyerTotal;

                    index += 1;
                    DetailRetenueRevFoncier.push({
                      ifuBailleur: `IF${index}`,
                      numCNIBailleur:
                        ArchCmptbList[i].comptabilisation_loyer_crediter[j].cin,
                      numCEBailleur:
                        ArchCmptbList[i].comptabilisation_loyer_crediter[j]
                          .carte_sejour,
                      nomPrenomBailleur:
                        ArchCmptbList[i].comptabilisation_loyer_crediter[j]
                          .nom_prenom,
                      adresseBailleur:
                        ArchCmptbList[i].comptabilisation_loyer_crediter[j]
                          .adresse_proprietaire,
                      adresseBien:
                        ArchCmptbList[i].comptabilisation_loyer_crediter[j]
                          .adresse_lieu,
                      typeBienBailleur: {
                        code: "LUC",
                      },
                      mntBrutLoyer: proprietaireMnts.mntBrutTotal.toFixed(2), //!!!!!!!
                      mntRetenueSource:
                        proprietaireMnts.mntRetenueSourceTotal.toFixed(2),
                      mntNetLoyer: proprietaireMnts.mntNetLoyerTotal.toFixed(2),
                      tauxRetenueRevFoncier: {
                        code: "TSR.10.2018",
                      },
                    });
                  }
                }
              }
            } //end For
          } //end For

          let Annex1 = {
            VersementRASRF: {
              $: {
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
              },
              identifiantFiscal: "IF",
              exerciceFiscalDu: req.params.annee + "-" + "01" + "-" + "01",
              exerciceFiscalAu: req.params.annee + "-" + 12 + "-" + 31,
              annee: currentYear,
              mois: currentMonth,
              totalMntBrutLoyer: TotalMntBrutLoyer.toFixed(2),
              totalMntRetenueSource: TotalMntRetenueSource.toFixed(2),
              totalMntNetLoyer: TotalMntLoyer.toFixed(2),
              listDetailRetenueRevFoncier: {
                DetailRetenueRevFoncier,
              },
            },
          };

          // Download the xml file
          helper.downloadXml(
            req,
            res,
            Annex1,
            `download/les maquettes DGI/annex 2/Annex1-${req.params.annee}.xml`
          );

          // Download the excel file
          // helper.generateExcel(
          //   req,
          //   res,
          //   Annex1,
          //   `./download/les maquettes DGI/les fichiers excel/annex 1/maquette_teledeclaration_${req.params.annee}.xlsx`
          // );
        } else {
          res
            .status(204)
            .send({ message: "Aucune donnée à afficher dans ce mois" });
        }
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  }, // end Function
};
