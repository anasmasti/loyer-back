const etatTaxes = require("../../models/situation_cloture/etatTaxes.schema");
const generatePdfs = require("../helpers/shared/generate_pdfs");
const exportUsersToExcel = require("../../helpers/generate_excel");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const etatMonsuelTaxes = async (req, res) => {
  let today = new Date();
  let dateToString = moment(today).format("YYYY-MM");

  await etatTaxes
    .findOne({
      mois: req.body.mois,
      annee: req.body.annee,
    })
    .then(async (contrat) => {
      try {
        if (contrat) {
          let montantNetGlobal = 0;
          let montantCautionGlobal = 0;
          let montantTaxeGlobal = 0;
          let montantTaxeAvanceGlobal = 0;
          let montantTaxeRappelGlobal = 0;
          let montantBrutGlobal = 0;
          let montantBrutAvanceGlobal = 0;
          let montantBrutRappelGlobal = 0;
          // Generate Excel
          const dataExcel = [];
          contrat.comptabilisation_loyer_crediter.forEach((cmpt) => {
            montantNetGlobal += cmpt.montant_net;
            // Caution
            montantCautionGlobal += !cmpt.caution_versee
              ? cmpt.caution_proprietaire
              : 0;

            // Avance
            montantTaxeAvanceGlobal += !cmpt.avance_versee
              ? cmpt.tax_avance_proprietaire
              : 0;
            montantBrutAvanceGlobal += !cmpt.avance_versee
              ? cmpt.montant_avance_proprietaire
              : 0;

            // Loyer
            montantBrutGlobal +=
              (cmpt.montant_avance_proprietaire != 0 && !cmpt.avance_versee) ||
              cmpt.is_overdued
                ? 0
                : cmpt.montant_brut_loyer;
            montantTaxeGlobal +=
              (cmpt.tax_avance_proprietaire != 0 && !cmpt.avance_versee) ||
              cmpt.is_overdued
                ? 0
                : cmpt.retenue_source;

            // Rappel
            montantBrutRappelGlobal +=
              cmpt.is_overdued && cmpt.montant_brut ? cmpt.montant_brut : 0;
            montantTaxeRappelGlobal +=
              cmpt.is_overdued && cmpt.montant_tax ? cmpt.montant_tax : 0;

            let cmptMapped = [
              cmpt.numero_contrat,
              cmpt.type_lieu,
              cmpt.cin,
              cmpt.nom_prenom,
              cmpt.declaration_option,
              cmpt.periodicite,
              cmpt.taux_impot,
              (cmpt.montant_avance_proprietaire != 0 && !cmpt.avance_versee) ||
              cmpt.is_overdued
                ? "--"
                : cmpt.montant_brut_loyer,
              !cmpt.avance_versee ? cmpt.montant_avance_proprietaire : 0,
              (cmpt.tax_avance_proprietaire != 0 && !cmpt.avance_versee) ||
              cmpt.is_overdued
                ? "--"
                : cmpt.retenue_source,
              !cmpt.avance_versee ? cmpt.tax_avance_proprietaire : 0,
              cmpt.is_overdued ? cmpt.montant_brut : 0,
              cmpt.is_overdued ? cmpt.montant_tax : 0,
              !cmpt.caution_versee ? cmpt.caution_proprietaire : "--",
              cmpt.montant_net,
            ];
            dataExcel.push(cmptMapped);
          });

          dataExcel.push([
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            +montantBrutGlobal.toFixed(2),
            +montantBrutAvanceGlobal.toFixed(2),
            +montantTaxeGlobal.toFixed(2),
            +montantTaxeAvanceGlobal.toFixed(2),
            +montantBrutRappelGlobal.toFixed(2),
            +montantTaxeRappelGlobal.toFixed(2),
            +montantCautionGlobal.toFixed(2),
            +montantNetGlobal.toFixed(2),
          ]);
          const workSheetColumnName = [
            "N° de contrat ",
            "Type d'entité",
            "CIN /IF",
            "Nom et prénom / R.S ",
            "D.S",
            "Périodicité",
            "Taux de taxe",
            "MT brut de loyer",
            "MT brut d'avance",
            "Taxe/loyer",
            "Taxe/avance",
            "MT brut (Rappel)",
            "Taxe (Rappel)",
            "Caution",
            "MT net",
          ];

          const workSheetName = "Etat Taxes";
          const filePath = `./download/generated situation/état_des_taxes_xlsx/état_des_taxes_${req.body.mois}_${req.body.annee}.xlsx`;
          // fs.createWriteStream(path.resolve(filePath));
          // fs.createReadStream(path.resolve(filePath));

          await exportUsersToExcel(
            dataExcel,
            workSheetColumnName,
            workSheetName,
            filePath,
            "état_des_taxes"
          );

          // Generate PDF
          generatePdfs.generateSituationPdf(
            {
              comptabilisation_loyer_crediter:
                contrat.comptabilisation_loyer_crediter,
              montant_brut_global: +montantBrutGlobal.toFixed(2),
              montant_brut_avance_global: +montantBrutAvanceGlobal.toFixed(2),
              montant_taxe_global: +montantTaxeGlobal.toFixed(2),
              montant_taxe_avance_global: +montantTaxeAvanceGlobal.toFixed(2),
              montant_net_global: +montantNetGlobal.toFixed(2),
              montant_caution_global: +montantCautionGlobal.toFixed(2),
              montantBrutRappelGlobal: +montantBrutRappelGlobal.toFixed(2),
              montantTaxeRappelGlobal: +montantTaxeRappelGlobal.toFixed(2),
              mois: contrat.mois,
              annee: contrat.annee,
              date_generation_de_virement: contrat.date_generation_de_virement,
            },
            "état_des_taxes",
            req.body.mois,
            req.body.annee
          );
        } else res.status(402).json({ message: "Empty data" });
      } catch (error) {
        console.log({ message: error.message });
      }
    })
    .catch((error) => {
      res.status(402).json({ message: error.message });
    });
};
module.exports = etatMonsuelTaxes;
