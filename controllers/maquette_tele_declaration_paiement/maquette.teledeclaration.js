const xml2js = require("xml2js");
const fs = require("fs");
const archivecomptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const archivevirements = require("../../models/archive/archiveVirement.schema");
const Contrat = require("../../models/contrat/contrat.model");
const Test = require("../../controllers/contrat/get.contrat");

// Today's Date
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth() + 1;

function CreateAnnex1ObjectFromArchvCompt(
  archivecomptabilisation,
  annee,
  mois
) {
  let DetailRetenueRevFoncier = [];
  let TotalMntBrutLoyer = 0;
  let TotalMntRetenueSource = 0;
  let TotalMntLoyer = 0;

  for (
    let i = 0;
    i < archivecomptabilisation.comptabilisation_loyer_crediter.length;
    i++
  ) {
    if (
      archivecomptabilisation.comptabilisation_loyer_crediter[i]
        .declaration_option == "non"
    ) {
      //Get Total Montant Brut/RS/Aprés l'impot
      TotalMntBrutLoyer +=
        archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_brut;
      TotalMntRetenueSource +=
        archivecomptabilisation.comptabilisation_loyer_crediter[i]
          .retenue_source || 0;
      TotalMntLoyer +=
        archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_net;
      //List DetailRetenueRevFoncier
      if (
        archivecomptabilisation.comptabilisation_loyer_crediter[i]
          .retenue_source > 0
      ) {
        DetailRetenueRevFoncier.push({
          ifuBailleur: `IF${i + 1}`,
          numCNIBailleur:
            archivecomptabilisation.comptabilisation_loyer_crediter[i].cin,
          numCEBailleur:
            archivecomptabilisation.comptabilisation_loyer_crediter[i]
              .carte_sejour,
          nomPrenomBailleur:
            archivecomptabilisation.comptabilisation_loyer_crediter[i]
              .nom_prenom,
          adresseBailleur:
            archivecomptabilisation.comptabilisation_loyer_crediter[i]
              .adresse_proprietaire,
          adresseBien:
            archivecomptabilisation.comptabilisation_loyer_crediter[i]
              .adresse_lieu,
          typeBienBailleur: {
            code: "LUC",
          },
          mntBrutLoyer:
            archivecomptabilisation.comptabilisation_loyer_crediter[
              i
            ].montant_brut.toFixed(2),
          mntRetenueSource:
            archivecomptabilisation.comptabilisation_loyer_crediter[
              i
            ].retenue_source.toFixed(2),
          mntNetLoyer:
            archivecomptabilisation.comptabilisation_loyer_crediter[
              i
            ].montant_net.toFixed(2),
          tauxRetenueRevFoncier: {
            code: "TSR.10.2018",
          },
        });
      }
    }
  }
  // Annex 1
  return {
    VersementRASRF: {
      $: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
      },
      identifiantFiscal: "IF",
      exerciceFiscalDu: annee + "-" + "01" + "-" + "01",
      exerciceFiscalAu: annee + "-" + 12 + "-" + 31,
      annee: annee,
      mois: mois,
      totalMntBrutLoyer: TotalMntBrutLoyer.toFixed(2),
      totalMntRetenueSource: TotalMntRetenueSource.toFixed(2),
      totalMntNetLoyer: TotalMntLoyer.toFixed(2),
      listDetailRetenueRevFoncier: {
        DetailRetenueRevFoncier,
      },
    },
  };
}

module.exports = {
  createAnnex1: async (req, res) => {
    let Annex1;
    let CurrentMonthContrats = [];
    let CompareDate;
    let check = false;

    archivecomptabilisation
      .findOne({ mois: req.params.mois, annee: req.params.annee })
      .sort({ updatedAt: "desc" })
      .then(async (data) => {
        return res.json(data);
        if (data) {
          Annex1 = await CreateAnnex1ObjectFromArchvCompt(
            data,
            req.params.annee,
            req.params.mois
          );

          // Get the alphabetical month
          let date = new Date(
            req.params.annee + " / " + req.params.mois + " / 1"
          );

          const AlphabeticalMonth = date.toLocaleString("default", {
            month: "short",
          });

          // Download the xml file
          var builder = new xml2js.Builder();
          var xml = builder.buildObject(Annex1);

          fs.writeFile(
            `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${req.params.annee}.xml`,
            xml,
            (error) => {
              if (error) {
                res.status(403).json({ message: error.message });
              } else {
                res.download(
                  `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${req.params.annee}.xml`
                );
              }
            }
          );
        }
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  },
};
