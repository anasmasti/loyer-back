const xml2js = require("xml2js");
const fs = require("fs");
const archivecomptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const archivevirements = require("../../models/archive/archiveVirement.schema");
const helper = require("../helpers/maquette_tele_declaration_paiement");

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
    let currentYear = req.params.annee;

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
                      numTSC: "-",
                      mntBrutLoyerAnnuel:
                        proprietaireMnts.mntBrutTotal.toFixed(2), //!!!!!!!
                      mntRetenueSourceAnnuel:
                        proprietaireMnts.mntRetenueSourceTotal.toFixed(2),
                      mntNetLoyerAnnuel:
                        proprietaireMnts.mntNetLoyerTotal.toFixed(2),
                      tauxRetenueRevFoncier: {
                        code: "TSR.10.2018",
                      },
                    });
                  }
                }
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
          helper.downloadXml(
            req,
            res,
            Annex2,
            `download/les maquettes DGI/annex 2/Annex2-${req.params.annee}.xml`
          );

          // Download the excel file
          helper.generateExcel(
            req,
            res,
            Annex2,
            `./download/les maquettes DGI/les fichiers excel/annex 2/maquette_teledeclaration_${req.params.annee}.xlsx`
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
};
