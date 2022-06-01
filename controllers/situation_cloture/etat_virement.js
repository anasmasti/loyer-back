const etatVirement = require("../../models/situation_cloture/etatVirement.schema");
const generatePdfs = require("../helpers/shared/generate_pdfs");
const exportUsersToExcel = require("../../helpers/generate_excel");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const etatMonsuelVirement = async (req, res) => {
  await etatVirement
    .findOne({
      mois: req.body.mois,
      annee: req.body.annee,
    })
    .then((contrat) => {
      let orderesVirement = [];
      // Object.assign(contrat, data);
      if (contrat) {
        let montantNetGlobal = 0;
        let montantTaxeGlobal = 0;
        let montantBrutGlobal = 0;

        // Generate Excel
        const dataExcel = [];

        contrat.ordre_virement.forEach((ordr_vrmnt) => {
          orderesVirement.push(ordr_vrmnt);
          montantNetGlobal += ordr_vrmnt.montant_net;
          montantTaxeGlobal += ordr_vrmnt.montant_taxe;
          montantBrutGlobal += ordr_vrmnt.montant_brut;
          let orderMapped = [
            ordr_vrmnt.nom_prenom,
            ordr_vrmnt.cin,
            ordr_vrmnt.numero_compte_bancaire,
            ordr_vrmnt.nom_agence_bancaire,
            ordr_vrmnt.banque,
            ordr_vrmnt.type_lieu,
            ordr_vrmnt.numero_contrat,
            ordr_vrmnt.periodicite,
            ordr_vrmnt.montant_brut,
            ordr_vrmnt.montant_taxe,
            ordr_vrmnt.montant_net,
          ];
          dataExcel.push(orderMapped);
        });
        dataExcel.push([
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          +montantBrutGlobal.toFixed(2),
          +montantTaxeGlobal.toFixed(2),
          +montantNetGlobal.toFixed(2),
        ]);

        const workSheetColumnName = [
          "Mandataire",
          "CIN/IF",
          "N° de compte",
          "Agence",
          "Banque",
          "Type d'entité",
          "N° de contrat",
          "Périodicité",
          "MT brut",
          "Taxe",
          "MT Net",
        ];

        const workSheetName = "Etat Virement";
        const filePath = `./download/generated situation/état_des_virements_xlsx/état_des_virements_${req.body.mois}_${req.body.annee}.xlsx`;
        fs.createWriteStream(path.resolve(filePath));
        // fs.createReadStream(path.resolve(filePath));

        exportUsersToExcel(
          dataExcel,
          workSheetColumnName,
          workSheetName,
          filePath,
          "état_des_virements"
        );

        // Generate Pdf
        generatePdfs.generateSituationPdf(
          {
            ordre_virement: orderesVirement,
            date_generation_de_virement: contrat.date_generation_de_virement,
            mois: contrat.mois,
            annee: contrat.annee,
            montant_brut_global: +montantBrutGlobal.toFixed(2),
            montant_taxe_global: +montantTaxeGlobal.toFixed(2),
            montant_net_global: +montantNetGlobal.toFixed(2),
          },
          "état_des_virements",
          req.body.mois,
          req.body.annee
        );
      } else res.status(402).json({ message: "Empty data" });
    })
    .catch((error) => {
      res.status(402).json({ message: error.message });
    });
};

module.exports = etatMonsuelVirement;
