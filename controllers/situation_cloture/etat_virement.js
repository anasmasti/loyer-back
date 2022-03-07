const etatVirement = require("../../models/situation_cloture/etatVirement.schema");
const generatePdf = require("../helpers/cloture/generateSituationPdf");
const exportUsersToExcel = require("../../helpers/generate_excel");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const etatMonsuelVirement = async (req, res) => {
  let today = new Date();
  let dateToString = moment(today).format("YYYY-MM");

  await etatVirement
    .find({
      mois: req.body.mois,
      annee: req.body.annee,
    })
    .then((data) => {
      if (data.length > 0) {
        // res.json(data);

        // Generate Pdf
        generatePdf(data, "état_des_virements");

        // Generate Excel
        const dataExcel = [];
        data.forEach((contrat) => {
          contrat.ordre_virement.forEach((ordr_vrmnt) => {
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
        });
        // const dataExcel = [
        //   [1, "Peter"],
        //   [2, "John"],
        // ];

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
        // [
        //   "N° de contrat ",
        //   "Type d'entité",
        //   "CIN /IF",
        //   "Nom et prénom / R.S ",
        //   "D.S",
        //   "Périodicité",
        //   "MT brut de loyer",
        //   "MT brut d'avance",
        //   "Taux de taxe",
        //   "Taxe/loyer",
        //   "Taxe/avance",
        //   "Caution",
        //   "MT net",
        // ]
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
      } else res.status(402).json({ message: "Empty data" });
    })
    .catch((error) => {
      res.status(402).json({ message: error.message });
    });
};
module.exports = etatMonsuelVirement;
