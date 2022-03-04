const xlsx = require("xlsx");
const path = require("path");
const storePaths = require("../controllers/helpers/etat_paths");
const moment = require("moment")

const exportExcel = (data, workSheetColumnNames, workSheetName, filePath, etatType) => {
  try {
    let today = new Date();
    // let dateToString = moment(today).format('YYYY-MM-DD')
    let dateToString = moment(today).format("YYYY-MM");
    const workBook = xlsx.utils.book_new();
    const workSheetData = [workSheetColumnNames, ...data];
    const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);

    xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
    xlsx.writeFile(workBook, path.resolve(filePath));
    storePaths(today.getMonth() + 1, today.getFullYear(), "xlsx", dateToString, etatType);
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = exportExcel;
