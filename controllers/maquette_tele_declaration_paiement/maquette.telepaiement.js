const xml2js = require("xml2js");
const fs = require("fs");
const archivecomptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const archivevirements = require("../../models/archive/archiveVirement.schema");

module.exports = {
  createAnnex2: async (req, res) => {
    let ArchCmptbList;
    let index = 0;
    let DetailRetenueRevFoncier = [];
    let TotalMntBrutLoyer = 0;
    let TotalMntRetenueSource = 0;
    let TotalMntLoyer = 0;
    let proprietaireList = [];

    // Current Date
    let currentDate = new Date();
    // let currentYear = currentDate.getFullYear();
    let currentYear = req.params.annee;

    function calculProprietaireMnts(ArchCmptbList, cinProprietaire) {
      let mntBrutTotal = 0;
      let mntRetenueSourceTotal = 0;
      let mntNetLoyerTotal = 0;
      ArchCmptbList.forEach((ArchCmptb) => {
        ArchCmptb.comptabilisation_loyer_crediter.forEach(
          (comptabilisationloyer) => {
            if (comptabilisationloyer.cin == cinProprietaire) {
              if (comptabilisationloyer.montant_avance_proprietaire == 0) {
                // console.log("-------------", comptabilisationloyer.tax_loyer);
                mntBrutTotal += comptabilisationloyer.montant_loyer;
                mntRetenueSourceTotal += comptabilisationloyer.retenue_source;
                mntNetLoyerTotal +=
                  comptabilisationloyer.montant_loyer -
                  comptabilisationloyer.retenue_source;
              }
              if (comptabilisationloyer.montant_avance_proprietaire > 0) {
                mntBrutTotal +=
                  comptabilisationloyer.montant_avance_proprietaire;
                mntRetenueSourceTotal +=
                  comptabilisationloyer.tax_avance_proprietaire;
                mntNetLoyerTotal +=
                  comptabilisationloyer.montant_avance_proprietaire -
                  comptabilisationloyer.tax_avance_proprietaire;
              }
            }
          }
        );
      });
      TotalMntBrutLoyer += mntBrutTotal;
      TotalMntRetenueSource += mntRetenueSourceTotal;
      TotalMntLoyer += mntNetLoyerTotal;
      proprietaireList.push(cinProprietaire);
      return {
        mntBrutTotal: mntBrutTotal,
        mntRetenueSourceTotal: mntRetenueSourceTotal,
        mntNetLoyerTotal: mntNetLoyerTotal,
      };
    }

    // Get the (archivecomptabilisation) data and put it in ArchCmptb variable
    archivecomptabilisation
      .find({ annee: req.params.annee })
      .then((data) => {
        return res.json(data)
        if (data.length > 0) {
          ArchCmptbList = data;
          // return res.json(data);
          // Filter object by object
          for (let i = 0; i < ArchCmptbList.length; i++) {
            for (
              let j = 0;
              j < ArchCmptbList[i].comptabilisation_loyer_crediter.length;
              j++
            ) {
              //Get Total Montant Brut/RAS/Aprés l'impot
              // TotalMntBrutLoyer +=
              //   ArchCmptbList[i].comptabilisation_loyer_crediter[j]
              //     .montant_brut;
              // TotalMntRetenueSource +=
              //   ArchCmptbList[i].comptabilisation_loyer_crediter[j]
              //     .montant_tax || 0;
              // TotalMntLoyer +=
              //   ArchCmptbList[i].comptabilisation_loyer_crediter[j].montant_net;

              if (
                !proprietaireList.includes(
                  ArchCmptbList[i].comptabilisation_loyer_crediter[j].cin
                )
              ) {
                let proprietaireMnts = calculProprietaireMnts(
                  ArchCmptbList,
                  ArchCmptbList[i].comptabilisation_loyer_crediter[j].cin
                );
                //List DetailRetenueRevFoncier
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
                  numTSC: 0,
                  mntBrutLoyerAnnuel: proprietaireMnts.mntBrutTotal.toFixed(2), //!!!!!!!
                  mntRetenueSourceAnnuel:
                    proprietaireMnts.mntRetenueSourceTotal.toFixed(2),
                  mntNetLoyerAnnuel:
                    proprietaireMnts.mntNetLoyerTotal.toFixed(2),
                  tauxRetenueRevFoncier: {
                    code: "TSR.10.2018",
                  },
                });
              }
            } //end For
          } //end For

          let Annex2 = {
            DeclarationRASRF: {
              $: {
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xsi:noNamespaceSchemaLocation": "DeclarationRASRF.xsd",
              },
              identifiantFiscal: "IF",
              exerciceFiscalDu: req.params.annee + "-" + "01" + "-" + "01",
              exerciceFiscalAu: req.params.annee + "-" + 12 + "-" + 31,
              annee: currentYear,
              totalMntBrutLoyer: TotalMntBrutLoyer.toFixed(2),
              totalMntRetenueSource: TotalMntRetenueSource.toFixed(2),
              totalMntNetLoyer: TotalMntLoyer.toFixed(2),
              listDetailRetenueRevFoncier: {
                DetailRetenueRevFoncier,
              },
            },
          };

          // Download the xml file
          var builder = new xml2js.Builder();
          var xml = builder.buildObject(Annex2);

          fs.writeFile(
            `download/les maquettes DGI/annex 2/Annex2-${req.params.annee}.xml`,
            xml,
            (error) => {
              if (error) {
                res.json({ message: error.message });
              } else {
                res.download(
                  `download/les maquettes DGI/annex 2/Annex2-${req.params.annee}.xml`
                );
              }
            }
          );
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

  //   Contrat.find({ deleted: false })
  //       .populate("lieu")
  //       .populate({ path: "lieu", populate: { path: "proprietaire" } })
  //       .then((data) => {
  //         if (data.length > 0) {
  //           // Make data unite ( Calculation )
  //           for (let index = 0; index < data.length; index++) {
  //             TotalMntBrutLoyer += data[index].total_montant_brut_loyer;
  //             TotalMntRetenueSource += data[index].retenue_source_par_mois;
  //             TotalMntRetenueSource += data[index].total_montant_net_loyer;

  //             //List DetailRetenueRevFoncier
  //             for (let j = 0; j < data[index].lieu.proprietaire.length; j++) {
  //               DetailRetenueRevFoncier.push({
  //                 ifuBailleur: i + 1,
  //                 numCNIBailleur: data[index].lieu.proprietaire[j].cin,
  //                 numCEBailleur: data[index].lieu.proprietaire[j].carte_sejour,
  //                 nomPrenomBailleur: data[index].lieu.proprietaire[j].nom_prenom,
  //                 adresseBailleur: data[index].lieu.proprietaire[j].adresse,
  //                 adresseBien: data[index].lieu.adresse,
  //                 typeBienBailleur: {
  //                   code: "LUC",
  //                 },
  //                 mntBrutLoyer: data[index].lieu.proprietaire[j].montant_loyer,
  //                 mntRetenueSource:
  //                   data[index].lieu.proprietaire[j].retenue_source,
  //                 mntNetLoyer:
  //                   data[index].lieu.proprietaire[j].montant_apres_impot,
  //                 tauxRetenueRevFoncier: {
  //                   code: "TSR.10.2018",
  //                 },
  //               });
  //             }
  //           }

  //           // Annex 1
  //           let Annex1 = {
  //             VersementRASRF: {
  //               $: {
  //                 "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
  //                 "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
  //               },
  //               identifiantFiscal: "IF",
  //               exerciceFiscalDu: req.params.annee + "-" + "1" + "-" + "1",
  //               // exerciceFiscalDu: "2021" + "-" + "1" + "-" + "1",
  //               exerciceFiscalAu: req.params.annee + "-" + 12 + "-" + 31,
  //               // exerciceFiscalAu: 2021 + "-" + 12 + "-" + 31,
  //               annee: currentYear,
  //               totalMntBrutLoyer: TotalMntBrutLoyer,
  //               totalMntRetenueSource: TotalMntRetenueSource,
  //               totalMntNetLoyer: TotalMntLoyer,
  //               listDetailRetenueRevFoncier: {
  //                 DetailRetenueRevFoncier,
  //               },
  //             },
  //           };

  //           // get the alphabetical month
  //           let dateGenerationComptabilisation = new Date(
  //             ArchCmptb.date_generation_de_comptabilisation
  //           );
  //           const AlphabeticalMonth =
  //             dateGenerationComptabilisation.toLocaleString("default", {
  //               month: "short",
  //             });

  //           // Download the xml file
  //           var builder = new xml2js.Builder();
  //           var xml = builder.buildObject(Annex1);

  //           fs.writeFile(
  //             `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`,
  //             xml,
  //             (error) => {
  //               if (error) {
  //                 res.status(403).json({ message: error.message });
  //               } else {
  //                 res.download(
  //                   `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`
  //                 );
  //               }
  //             }
  //           );
  //         } else {
  //           // Get the (archivecomptabilisation) data and put it in ArchCmptb variable
  //           archivecomptabilisation
  //             .find({ mois: mois, annee: annee })
  //             .then((data) => {
  //                 ArchCmptb = data[0]
  //                 // Main Method
  //                 for (
  //                   let i = 0;
  //                   i < ArchCmptb.comptabilisation_loyer_crediter.length;
  //                   i++
  //                 ) {
  //                   //Get Total Montant Brut/RAS/Aprés l'impot
  //                   TotalMntBrutLoyer +=
  //                     ArchCmptb.comptabilisation_loyer_crediter[i].montant_brut;
  //                   TotalMntRetenueSource +=
  //                     ArchCmptb.comptabilisation_loyer_crediter[i].montant_tax || 0;
  //                   TotalMntLoyer +=
  //                     ArchCmptb.comptabilisation_loyer_crediter[i].montant_net;
  //                   //List DetailRetenueRevFoncier
  //                   DetailRetenueRevFoncier.push({
  //                     ifuBailleur: i + 1,
  //                     numCNIBailleur: ArchCmptb.comptabilisation_loyer_crediter[i].cin,
  //                     numCEBailleur:
  //                       ArchCmptb.comptabilisation_loyer_crediter[i].carte_sejour,
  //                     nomPrenomBailleur:
  //                       ArchCmptb.comptabilisation_loyer_crediter[i].nom_prenom,
  //                     adresseBailleur:
  //                       ArchCmptb.comptabilisation_loyer_crediter[i].adresse_proprietaire,
  //                     adresseBien:
  //                       ArchCmptb.comptabilisation_loyer_crediter[i].adresse_lieu,
  //                     typeBienBailleur: {
  //                       code: "LUC",
  //                     },
  //                     mntBrutLoyer:
  //                       ArchCmptb.comptabilisation_loyer_crediter[i].montant_brut, //!!!!!!!
  //                     // mntRetenueSource: data[0].retenue_source_par_mois,
  //                     mntRetenueSource:
  //                       ArchCmptb.comptabilisation_loyer_crediter[i].montant_tax,
  //                     mntNetLoyer:
  //                       ArchCmptb.comptabilisation_loyer_crediter[i].montant_net,
  //                     tauxRetenueRevFoncier: {
  //                       code: "TSR.10.2018",
  //                     },
  //                   });
  //                 }
  //                 // Annex 1
  //                 let Annex1 = {
  //                   VersementRASRF: {
  //                     $: {
  //                       "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
  //                       "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
  //                     },
  //                     identifiantFiscal: "IF",
  //                     exerciceFiscalDu: req.params.annee + "-" + "1" + "-" + "1",
  //                     // exerciceFiscalDu: "2021" + "-" + "1" + "-" + "1",
  //                     exerciceFiscalAu: req.params.annee + "-" + 12 + "-" + 31,
  //                     // exerciceFiscalAu: 2021 + "-" + 12 + "-" + 31,
  //                     annee: currentYear,
  //                     totalMntBrutLoyer: TotalMntBrutLoyer,
  //                     totalMntRetenueSource: TotalMntRetenueSource,
  //                     totalMntNetLoyer: TotalMntLoyer,
  //                     listDetailRetenueRevFoncier: {
  //                       DetailRetenueRevFoncier,
  //                     },
  //                   },
  //                 };
  //                 // get the alphabetical month
  //                 let dateGenerationComptabilisation = new Date(ArchCmptb.date_generation_de_comptabilisation)
  //                 const AlphabeticalMonth = dateGenerationComptabilisation.toLocaleString("default", { month: "short" });
  //                 // Download the xml file
  //                 var builder = new xml2js.Builder();
  //                 var xml = builder.buildObject(Annex1);
  //                 fs.writeFile(`download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`, xml, (error) => {
  //                   if (error) {
  //                     res.status(403).json({ message: error.message });
  //                   } else {
  //                     res.download(`download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`);
  //                   }
  //                 });
  //             })
  //             .catch((error) => {
  //               res.status(403).json({ message: error.message });
  //             });
  //         }

  //         // res.send(data);
  //       })
  //       .catch((error) => {
  //         res.status(403).json({ message: error.message });
  //       });
  //   },
};
