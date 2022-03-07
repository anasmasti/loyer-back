const etatTaxes = require("../../models/situation_cloture/etatTaxes.schema");
const generatePdf = require("../helpers/cloture/generateSituationPdf");
const exportUsersToExcel = require("../../helpers/generate_excel");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const etatMonsuelTaxes = async (req, res) => {
  let today = new Date();
  let dateToString = moment(today).format("YYYY-MM");

  await etatTaxes
    .find({
      mois: req.body.mois,
      annee: req.body.annee,
    })
    .then((data) => {
      if (data.length > 0) {
        // Generate PDF
        generatePdf(data, "état_des_taxes");

        // Generate Excel
        const dataExcel = [];
        data.forEach((contrat) => {
          contrat.comptabilisation_loyer_crediter.forEach((cmpt) => {
            let cmptMapped = [
              cmpt.numero_contrat,
              cmpt.type_lieu,
              cmpt.cin,
              cmpt.nom_prenom,
              "ds",
              cmpt.periodicite,
              cmpt.montant_brut,
              cmpt.montant_avance_proprietaire,
              cmpt.taux_impot,
              cmpt.montant_tax,
              cmpt.tax_avance_proprietaire,
              cmpt.caution_proprietaire,
              cmpt.montant_net,
            ];
            dataExcel.push(cmptMapped);
          });
        });
        const workSheetColumnName = [
          "N° de contrat ",
          "Type d'entité",
          "CIN /IF",
          "Nom et prénom / R.S ",
          "D.S",
          "Périodicité",
          "MT brut de loyer",
          "MT brut d'avance",
          "Taux de taxe",
          "Taxe/loyer",
          "Taxe/avance",
          "Caution",
          "MT net",
        ];
        const workSheetName = "Etat Taxes";
        const filePath = `./download/generated situation/état_des_taxes_xlsx/état_des_taxes_${req.body.mois}_${req.body.annee}.xlsx`;
        fs.createWriteStream(path.resolve(filePath));
        // fs.createReadStream(path.resolve(filePath));

        exportUsersToExcel(
          dataExcel,
          workSheetColumnName,
          workSheetName,
          filePath,
          "état_des_taxes"
        );
      } else res.status(402).json({ message: "Empty data" });
    })
    .catch((error) => {
      res.status(402).json({ message: error.message });
    });
};
module.exports = etatMonsuelTaxes;
