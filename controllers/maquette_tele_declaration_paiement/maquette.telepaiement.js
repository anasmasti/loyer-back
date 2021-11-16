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

    // Current Date
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();

    // Get the (archivecomptabilisation) data and put it in ArchCmptb variable
    archivecomptabilisation
      .find({ annee: req.params.annee })
      .then((data) => {
        ArchCmptbList = data;

        // Filter object by object
        for (let i = 0; i < ArchCmptbList.length; i++) {
          GetDetailRtnRevFoncier(ArchCmptbList[i]);
        } //end For

        function GetDetailRtnRevFoncier(ArchCmptb) {
          for (
            let i = 0;
            i < ArchCmptb.comptabilisation_loyer_crediter.length;
            i++
          ) {
            //Get Total Montant Brut/RAS/Aprés l'impot
            TotalMntBrutLoyer +=
              ArchCmptb.comptabilisation_loyer_crediter[i].montant_brut;
            TotalMntRetenueSource +=
              ArchCmptb.comptabilisation_loyer_crediter[i].montant_tax || 0;
            TotalMntLoyer +=
              ArchCmptb.comptabilisation_loyer_crediter[i].montant_net;

            //List DetailRetenueRevFoncier
            index += 1;
            DetailRetenueRevFoncier.push({
              ifuBailleur: index,
              numCNIBailleur: ArchCmptb.comptabilisation_loyer_crediter[i].cin,
              numCEBailleur:
                ArchCmptb.comptabilisation_loyer_crediter[i].carte_sejour,
              nomPrenomBailleur:
                ArchCmptb.comptabilisation_loyer_crediter[i].nom_prenom,
              adresseBailleur:
                ArchCmptb.comptabilisation_loyer_crediter[i]
                  .adresse_proprietaire,
              adresseBien:
                ArchCmptb.comptabilisation_loyer_crediter[i].adresse_lieu,
              typeBienBailleur: {
                code: "LUC",
              },
              mntBrutLoyer:
                ArchCmptb.comptabilisation_loyer_crediter[i].montant_brut, //!!!!!!!
              mntRetenueSource:
                ArchCmptb.comptabilisation_loyer_crediter[i].montant_tax,
              mntNetLoyer:
                ArchCmptb.comptabilisation_loyer_crediter[i].montant_net,
              tauxRetenueRevFoncier: {
                code: "TSR.10.2018",
              },
            });
          } //end For
        } //end Function

        let Annex2 = {
          VersementRASRF: {
            $: {
              "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
              "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
            },
            identifiantFiscal: "IF",
            exerciceFiscalDu: req.params.annee + "-" + "1" + "-" + "1",
            exerciceFiscalAu: req.params.annee + "-" + 12 + "-" + 31,
            annee: currentYear,
            totalMntBrutLoyer: TotalMntBrutLoyer,
            totalMntRetenueSource: TotalMntRetenueSource,
            totalMntNetLoyer: TotalMntLoyer,
            listDetailRetenueRevFoncier: {
              DetailRetenueRevFoncier,
            },
          },
        };

        // Download the xml file 
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(Annex2);

        fs.writeFile(`download/les maquettes DGI/annex 2/Annex2-${req.params.annee}.xml`, xml, (error) => {
          if (error) {
            res.json({ message: error.message });
          } else {
            res.download(`download/les maquettes DGI/annex 2/Annex2-${req.params.annee}.xml`);
          }
        });
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  }, // end Function
};
