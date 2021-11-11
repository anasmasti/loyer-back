const xml2js = require("xml2js");
const fs = require("fs");
const archivecomptabilisation = require("../../models/archive/archiveComptabilisationLoyer.schema");
const archivevirements = require("../../models/archive/archiveVirement.schema");

module.exports = {
  createAnnex2: async (_, res) => {
    let ArchCmptbList;
    let ArchVirmtList;
    let DetailRetenueRevFoncier = [];
    let TotalMntBrutLoyer = 0;
    let TotalMntRetenueSource;
    let TotalMntApreImpot;

    // Current Date
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();

    // Get the (archivecomptabilisation) data and put it in ArchCmptb variable
    archivecomptabilisation
      .find({ annee: 2021 })
      .then((data) => {
        ArchCmptbList = data;
      })
      .catch((error) => {
        console.log(error);
      });

    // Get the (archivevirements) data and put it in ArchVirmt variable
    archivevirements
      .find({ mois: 6, annee: 2021 })
      .then((data) => {
        ArchVirmtList = data;
      })
      .catch((error) => {
        console.log(error);
      });

    setTimeout(() => {
      // Filter month by month
      for (let i = 0; i < ArchCmptbList.length; i++) {
        for (let j = 0; j < ArchVirmtList.length; j++) {
          if (ArchCmptbList[i].mois == ArchVirmtList[j].mois) {
            GetDetailRtnRevFoncier(ArchCmptbList[i], ArchVirmtList[j]);
          }
        }
      }

      function GetDetailRtnRevFoncier(ArchCmptb, ArchVirmt) {
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

        console.log(DetailRetenueRevFoncier);
      }

      let Annex2 = {
        VersementRASRF: {
          $: {
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
          },
          identifiantFiscal: "IF",
          //   exerciceFiscalDu: req.body.annee + '-' + '1' + '-' + '1',
          exerciceFiscalDu: '2021' + "-" + '1' + "-" + '1',
          //   exerciceFiscalAu: req.body.annee + "-" + 12 + "-" + 31,
          exerciceFiscalAu: '2021' + "-" + '12' + "-" + '31',
        //   exerciceFiscalDu: data[0].date_debut_loyer,
        //   exerciceFiscalAu:
        //     data[0].etat_contrat.libelle == "Résiliation"
        //       ? data[0].etat_contrat.etat.date_resiliation
        //       : 2021 + "-" + 12 + "-" + 31,
          annee: currentYear,
          totalMntBrutLoyer: TotalMntBrutLoyer,
          totalMntRetenueSource: '0000',
          totalMntNetLoyer: '0000',
          listDetailRetenueRevFoncier: {
            DetailRetenueRevFoncier
          },
        },
      };

      res.json(ArchCmptbList);
    }, 1000);
  },

  // Default Code //
  // createAnnex2: async (_, res) => {

  //     Contrat.find({ _id: '612f5ab155473640bc2b2cb4' }).populate('lieu').populate('foncier').populate({ path: 'foncier', populate: { path: 'proprietaire' } })
  //         .then((data) => {

  //             let date = new Date(data[0].date_debut_loyer)
  //             let currentYear = date.getFullYear()

  //             let Annex2 = {
  //                 VersementRASRF: {
  //                     $: {
  //                         'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  //                         'xsi:noNamespaceSchemaLocation': "VersementRASRF.xsd"
  //                     },
  //                     identifiantFiscal: "IF",
  //                     exerciceFiscalDu: data[0].date_debut_loyer,
  //                     exerciceFiscalAu: data[0].etat_contrat.libelle == 'Résiliation' ? data[0].etat_contrat.etat.date_resiliation : 2021 + '-' + 12 + '-' + 31,
  //                     annee: currentYear,
  //                     mois: data[0].duree,
  //                     totalMntBrutLoyer: data[0].total_montant_brut_loyer,
  //                     totalMntRetenueSource: data[0].retenue_source,
  //                     totalMntNetLoyer: data[0].total_montant_net_loyer,
  //                     listDetailRetenueRevFoncier: {
  //                         DetailRetenueRevFoncier: {
  //                             ifuBailleur: 001,
  //                             numCNIBailleur: data[0].foncier.proprietaire.cin,
  //                             numCEBailleur: data[0].foncier.proprietaire.carte_sejour,
  //                             nomPrenomBailleur: data[0].foncier.proprietaire.nom_prenom,
  //                             adresseBailleur: data[0].foncier.proprietaire.adresse,
  //                             adresseBien: data[0].foncier.adresse,
  //                             typeBienBailleur: {
  //                                 code: 'LUC'
  //                             },
  //                             numTSC: 'N005',
  //                             mntBrutLoyerAnnuel: data[0].total_montant_brut_loyer,
  //                             mntRetenueSourceAnnuel: data[0].retenue_source,
  //                             mntNetLoyerAnnuel: data[0].total_montant_net_loyer,
  //                             tauxRetenueRevFoncier: {
  //                                 code: 'TSR.10.2018'
  //                             }
  //                         },

  //                     },
  //                 }
  //             };

  //             var builder = new xml2js.Builder();
  //             var xml = builder.buildObject(Annex2);
  //             console.dirxml(xml);

  //             fs.writeFile('download/Annex2.xml', xml, (error) => {
  //                 if (error) {
  //                     res.json({ message: error.message })
  //                 } else {
  //                     res.download('download/Annex2.xml')
  //                 }

  //             })

  //         })
  //         .catch((error) => {
  //             res.status(403).send({ message: error.message })
  //         })

  // }
};
