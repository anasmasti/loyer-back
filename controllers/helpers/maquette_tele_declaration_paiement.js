const xml2js = require("xml2js");
const exportUsersToExcel = require("../../helpers/generate_excel");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

module.exports = {
  downloadXml: (req, res, annex, pathString) => {
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(annex);

    fs.writeFile(`${pathString}`, xml, (error) => {
      if (error) {
        res.json({ message: error.message });
      } else {
        res.download(`${pathString}`);
      }
    });
  },

  generateExcel: (req, res, annex, pathString) => {
    // Generate Excel
    const dataExcel = [];
    annex.DeclarationRASRF.listDetailRetenueRevFoncier.DetailRetenueRevFoncier.forEach(
      (DetailRetenueRevFoncier) => {
        let cmptMapped = [
          DetailRetenueRevFoncier.ifuBailleur,
          DetailRetenueRevFoncier.numCNIBailleur,
          DetailRetenueRevFoncier.numCEBailleur,
          DetailRetenueRevFoncier.nomPrenomBailleur,
          DetailRetenueRevFoncier.adresseBailleur,
          DetailRetenueRevFoncier.adresseBien,
          DetailRetenueRevFoncier.typeBienBailleur.code,
          DetailRetenueRevFoncier.numTSC,
          DetailRetenueRevFoncier.mntBrutLoyerAnnuel,
          DetailRetenueRevFoncier.mntRetenueSourceAnnuel,
          DetailRetenueRevFoncier.mntNetLoyerAnnuel,
          DetailRetenueRevFoncier.tauxRetenueRevFoncier.code,
        ];
        dataExcel.push(cmptMapped);
      }
    );

    dataExcel.push(["", "", "", "", "", "", "", "", "", "", "", ""]);

    dataExcel.push([
      "",
      "",
      "",
      "identifiantFiscal",
      "exerciceFiscalDu",
      "exerciceFiscalAu",
      "annee",
      "totalMntBrutLoyer",
      "totalMntRetenueSource",
      "totalMntNetLoyer",
      "",
      "",
    ]);

    dataExcel.push([
      "",
      "",
      "",
      annex.DeclarationRASRF.identifiantFiscal,
      annex.DeclarationRASRF.exerciceFiscalDu,
      annex.DeclarationRASRF.exerciceFiscalAu,
      annex.DeclarationRASRF.annee,
      annex.DeclarationRASRF.totalMntBrutLoyer,
      annex.DeclarationRASRF.totalMntRetenueSource,
      annex.DeclarationRASRF.totalMntNetLoyer,
      "",
      "",
    ]);

    const workSheetColumnName = [
      "ifuBailleur",
      "numCNIBailleur",
      "numCEBailleur",
      "nomPrenomBailleur",
      "adresseBailleur",
      "adresseBien",
      "typeBienBailleur",
      "numTSC",
      "mntBrutLoyerAnnuel",
      "mntRetenueSourceAnnuel",
      "mntNetLoyerAnnuel",
      "tauxRetenueRevFoncier",
    ];
    const workSheetName = "teledeclaration annuelle";
    const filePath = `${pathString}`;
    fs.createWriteStream(path.resolve(filePath));

    exportUsersToExcel(
      dataExcel,
      workSheetColumnName,
      workSheetName,
      filePath,
      "état_des_taxes"
    );
  },
};
