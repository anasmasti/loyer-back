const etatTaxes = require("../../models/situation_cloture/etatTaxes.schema");
const generatePdf = require("../helpers/cloture/generateSituationPdf");
const exportUsersToExcel = require("../../helpers/generate_excel");
const fs = require("fs");
const path = require("path");

module.exports = {
  etatMonsuelTaxes: async (req, res) => {
    await etatTaxes
      .find({
        mois: req.body.mois,
        annee: req.body.annee,
      })
      .then((data) => {
        if (data.length > 0) {
          // res.json(data);
          generatePdf(data, "état_taxes");

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
           const workSheetColumnName = 
           [
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
           ]
           const workSheetName = "Etat Taxes";
           const filePath = `./download/generated situation/état_taxes/xlsx/état_taxes_${req.body.mois}-${req.body.annee}.xlsx`;
           fs.createReadStream(path.resolve(filePath));
 
           exportUsersToExcel(
             dataExcel,
             workSheetColumnName,
             workSheetName,
             filePath,
             'état_taxes'
           );
        } else res.status(402).json({ message: "Empty data" });
      })
      .catch((error) => {
        res.status(402).json({ message: error.message });
      });
  },
};
