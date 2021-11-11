const xml2js = require("xml2js");
const fs = require("fs");
const archivecomptabilisation = require("../../models/archive/archiveComptabilisationLoyer.schema");
const archivevirements = require("../../models/archive/archiveVirement.schema");

module.exports = {
  createAnnex1: async (req, res) => {
    let ArchCmptb;
    let ArchVirmt;
    let DetailRetenueRevFoncier = [];
    let TotalMntBrutLoyer = 0;
    let TotalMntRetenueSource;
    let TotalMntApreImpot;

    // Current Date
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    // let TestResult = archivecomptabilisation.find({ mois: req.body.mois , annee: req.body.annee })

    // Get the (archivecomptabilisation) data and put it in ArchCmptb variable
    archivecomptabilisation
      .find({ mois: 6, annee: 2021 })
      .then((data) => {
        ArchCmptb = data[0];
      })
      .catch((error) => {
        console.log(error);
      });

    // Get the (archivevirements) data and put it in ArchVirmt variable
    archivevirements
      .find({ mois: 6, annee: 2021 })
      .then((data) => {
        ArchVirmt = data[0];
      })
      .catch((error) => {
        console.log(error);
      });

    setTimeout(() => {
      // Main Method
      //   for (let i = 0; i < ArchVirmt.ordre_virement.length; i++) {
      //     //Get Total Montant Brut/RAS/Aprés l'impot
      //     TotalMntBrutLoyer +=
      //       ArchCmptb.comptabilisation_paiement_loyer[i].montant_brut;
      //     // TotalMntRetenueSource += ArchCmptb.comptabilisation_paiement_loyer[i].retenue_source;
      //     // TotalMntApreImpot += ArchCmptb.comptabilisation_paiement_loyer[i].total_montant_net_loyer;

      //     //List DetailRetenueRevFoncier
      //     for (
      //       let j = 0;
      //       j < ArchCmptb.comptabilisation_paiement_loyer.length;
      //       j++
      //     ) {
      //       // console.log(ArchCmptb.comptabilisation_paiement_loyer[j]);
      //       if (
      //         ArchVirmt.ordre_virement[i].cin ==
      //           ArchCmptb.comptabilisation_paiement_loyer[j].cin ||
      //         ArchVirmt.ordre_virement[i].passport ==
      //           ArchCmptb.comptabilisation_paiement_loyer[j].passport ||
      //         ArchVirmt.ordre_virement[i].carte_sejour ==
      //           ArchCmptb.comptabilisation_paiement_loyer[j].carte_sejour
      //       ) {
      //         DetailRetenueRevFoncier.push({
      //           ifuBailleur: i + 1,
      //           numCNIBailleur: ArchVirmt.ordre_virement[i].cin,
      //           // numCEBailleur: ArchVirmt.ordre_virement[i].carte_sejour,
      //           numCEBailleur: 111,
      //           nomPrenomBailleur: ArchVirmt.ordre_virement[i].nom_prenom,
      //           // adresseBailleur: ArchVirmt.ordre_virement[i].adresse,
      //           adresseBailleur: "Test adresse",
      //           // adresseBien: data[0].foncier.adresse,
      //           adresseBien: "Test adresse",
      //           typeBienBailleur: {
      //             code: "LUC",
      //           },
      //           mntBrutLoyer:
      //             ArchCmptb.comptabilisation_paiement_loyer[j].montant_brut, //!!!!!!!
      //           // mntRetenueSource: data[0].retenue_source_par_mois,
      //           mntRetenueSource: "00000",
      //           mntNetLoyer: "00000",
      //           tauxRetenueRevFoncier: {
      //             code: "TSR.10.2018",
      //           },
      //         });
      //       }
      //     }
      //   }

      // Initial Method
      for (let i = 0; i < ArchVirmt.ordre_virement.length; i++) {
        //Get Total Montant Brut/RAS/Aprés l'impot
        TotalMntBrutLoyer +=
          ArchCmptb.comptabilisation_paiement_loyer[i].montant_brut;
        // TotalMntRetenueSource += ArchCmptb.comptabilisation_paiement_loyer[i].retenue_source;
        // TotalMntApreImpot += ArchCmptb.comptabilisation_paiement_loyer[i].total_montant_net_loyer;

        //List DetailRetenueRevFoncier

        DetailRetenueRevFoncier.push({
          ifuBailleur: i + 1,
          numCNIBailleur: ArchVirmt.ordre_virement[i].cin,
          // numCEBailleur: ArchVirmt.ordre_virement[i].carte_sejour,
          numCEBailleur: 111,
          nomPrenomBailleur: ArchVirmt.ordre_virement[i].nom_prenom,
          // adresseBailleur: ArchVirmt.ordre_virement[i].adresse,
          adresseBailleur: "Test adresse",
          // adresseBien: data[0].foncier.adresse,
          adresseBien: "Test adresse",
          typeBienBailleur: {
            code: "LUC",
          },
          mntBrutLoyer:
            ArchCmptb.comptabilisation_paiement_loyer[i].montant_brut, //!!!!!!!
          // mntRetenueSource: data[0].retenue_source_par_mois,
          mntRetenueSource: "00000",
          mntNetLoyer: "00000",
          tauxRetenueRevFoncier: {
            code: "TSR.10.2018",
          },
        });
      }

      // Annex 1
      let Annex1 = {
        VersementRASRF: {
          $: {
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
          },
          identifiantFiscal: "IF",
          //   exerciceFiscalDu: req.body.annee + '-' + '1' + '-' + '1',
          exerciceFiscalDu: "2021" + "-" + "1" + "-" + "1",
          //   exerciceFiscalAu: req.body.annee + "-" + 12 + "-" + 31,
          exerciceFiscalAu: 2021 + "-" + 12 + "-" + 31,
          annee: currentYear,
          mois: currentMonth,
          totalMntBrutLoyer: TotalMntBrutLoyer,
          totalMntRetenueSource: "99999",
          totalMntNetLoyer:
            ArchCmptb.comptabilisation_paiement_loyer[0].montant_net,
            listDetailRetenueRevFoncier:{
              DetailRetenueRevFoncier
            }
        },
      };
      //   console.log(Annex1);
      //   res.json(Annex1);

      var builder = new xml2js.Builder();
      var xml = builder.buildObject(Annex1);

      fs.writeFile("download/Annex1.xml", xml, (error) => {
        if (error) {
          res.status(403).json({ message: error.message });
        } else {
          res.download("download/Annex1.xml");
        }
      });

      // res.json([comptabilisationData, virementData])
    }, 1000);
    // res.json({ massage: "Gooood" });

    // DetailRetenueRevFoncier: {
    //     ifuBailleur: 001,
    //     numCNIBailleur: data[0].foncier.proprietaire.cin,
    //     numCEBailleur: data[0].foncier.proprietaire.carte_sejour,
    //     nomPrenomBailleur: data[0].foncier.proprietaire.nom_prenom,
    //     adresseBailleur: data[0].foncier.proprietaire.adresse,
    //     adresseBien: data[0].foncier.adresse,
    //     typeBienBailleur: {
    //       code: "LUC",
    //     },
    //     mntBrutLoyer: data[0].montant_loyer,
    //     mntRetenueSource: data[0].retenue_source_par_mois,
    //     mntNetLoyer: data[0].montant_apres_impot,
    //     tauxRetenueRevFoncier: {
    //       code: "TSR.10.2018",
    //     },
    //   },

    // console.log(ArchCmptb);
    // res.json(ArchCmptb)
    // Contrat.find({ _id: '6135f15c65c6b8345c64ae95' }).populate('lieu').populate('foncier').populate({ path: 'foncier', populate: { path: 'proprietaire' } })
    //     .then((data) => {

    //         let date = new Date(data[0].date_debut_loyer)
    //         let currentYear = date.getFullYear()

    //         let Annex1 = {
    //             VersementRASRF: {
    //                 $: {
    //                     'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    //                     'xsi:noNamespaceSchemaLocation': "VersementRASRF.xsd"
    //                 },
    //                 identifiantFiscal: "IF",
    //                 exerciceFiscalDu: data[0].date_debut_loyer,
    //                 exerciceFiscalAu: data[0].etat_contrat.libelle == 'Résiliation' ? data[0].etat_contrat.etat.date_resiliation : 2021 + '-' + 12 + '-' + 31,
    //                 annee: currentYear,
    //                 mois: data[0].duree,
    //                 totalMntBrutLoyer: data[0].total_montant_brut_loyer,
    //                 totalMntRetenueSource: data[0].retenue_source,
    //                 totalMntNetLoyer: data[0].total_montant_net_loyer,
    //                 listDetailRetenueRevFoncier: {
    //                     DetailRetenueRevFoncier: {
    //                         ifuBailleur: 001,
    //                         numCNIBailleur: data[0].foncier.proprietaire.cin,
    //                         numCEBailleur: data[0].foncier.proprietaire.carte_sejour,
    //                         nomPrenomBailleur: data[0].foncier.proprietaire.nom_prenom,
    //                         adresseBailleur: data[0].foncier.proprietaire.adresse,
    //                         adresseBien: data[0].foncier.adresse,
    //                         typeBienBailleur: {
    //                             code: 'LUC'
    //                         },
    //                         mntBrutLoyer: data[0].montant_loyer,
    //                         mntRetenueSource: data[0].retenue_source_par_mois,
    //                         mntNetLoyer: data[0].montant_apres_impot,
    //                         tauxRetenueRevFoncier: {
    //                             code: 'TSR.10.2018'
    //                         }
    //                     },

    //                 },
    //             }
    //         };

    //         // var builder = new xml2js.Builder();
    //         // var xml = builder.buildObject(Annex1);

    //             })
    //             .catch((error) => {
    //                 res.status(409).send({ message: error.message })
    // })
  },
};
