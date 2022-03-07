const fs = require("fs");
const htmlPdf = require("html-pdf");
const handlebars = require("handlebars");
const moment = require("moment");
const etatPaths = require("../../../models/situation_cloture/etatPaths.schema");
// const storePaths = require("../etat_paths");

async function generatePdf(data1, etatType) {
  let data = data1;
  console.log(etatType);
  let htmlFileSrouce,
    options,
    reportingPaths = [];
    // let dateToString = moment(today).format('YYYY-MM-DD')
  let today = new Date();
  let dateToString = moment(today).format("YYYY-MM");
  let etatReportingOptions = ["état_des_virements", "état_des_taxes"];

  for (const item in etatReportingOptions) {
    console.log('teeeeeeeeeeeeeeeeeeest');
    if (etatType == etatReportingOptions[item]) {
      htmlFileSrouce = fs.readFileSync(
        "./templates/situation_cloture/" + etatType + ".html",
        "utf8"
      );
      options = {
        format: "A4",
        base: "file://" + __dirname + "/public/images/",
      };
    }
  }

  let template = handlebars.compile(htmlFileSrouce);
  let htmlToSend = template(data, {
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true,
  });
// console.log(`/download/generated situation/${etatType}_pdf/${etatType}_${dateToString}.pdf`);
  let extention = "pdf";
  htmlPdf.create(htmlToSend, options).toFile(
    `download/generated situation/${etatType}_pdf/${etatType}_${dateToString}.pdf`,
    // `/download/generated situation/etat_virement/etat_virement_${dateToString}.pdf`,
    async function (err, res) {
      if (err) {
        console.log(err);
      } else {
        await etatPaths
          .find({
            mois: today.getMonth() + 1,
            annee: today.getFullYear(),
          })
          .then(async (data) => {
            // return console.log(data);
            try {
              if (data.length == 0) {
                console.log("teeeeest");
                reportingPaths.push({
                  [`${etatType}_${extention}`]: `download/generated situation/${etatType}_${extention}/${etatType}_${dateToString}.${extention}`,
                });
                let etat_paths = new etatPaths({
                  etat_paths: reportingPaths,
                  mois: today.getMonth() + 1,
                  annee: today.getFullYear(),
                });
                console.log(etat_paths);
                await etat_paths.save();
              } else {
                console.log("test 4");
                for (let i = 0; i < data[0].etat_paths.length; i++) {
                  // for (j in data[0].etat_paths[i]) {
                  //   if (
                  //     data[0].etat_paths[i][j] ==
                  //     `download/generated situation/${etatType}_${extention}/${etatType}_${dateToString}.${extention}`
                  //   ) {
                  //     reportingPaths.push({
                  //       [`${etatType}_${extention}`]: `download/generated situation/${etatType}_${extention}/${etatType}_${dateToString}.${extention}`,
                  //       extention: extention,
                  //     });
                  //   } else {
                  reportingPaths.push(data[0].etat_paths[i]);
                  //   }
                  // }
                }
                let pathExist = false;
                for (let k = 0; k < reportingPaths.length; k++) {
                  if (
                    Object.keys(reportingPaths[k])[0] ==
                    `${etatType}_${extention}`
                  ) {
                    pathExist = true;
                  }
                }
                if (pathExist == false) {
                  console.log("eeeeeeeeeeeedhegdekjdge");
                  reportingPaths.push({
                    [`${etatType}_${extention}`]: `download/generated situation/${etatType}_${extention}/${etatType}_${dateToString}.${extention}`,
                    extention: extention,
                  });
                }
                await etatPaths.findOneAndUpdate(
                  { mois: today.getMonth() + 1, annee: today.getFullYear() },
                  {
                    etat_paths: reportingPaths,
                    mois: data[0].mois,
                    annee: data[0].annee,
                  }
                );
              }
            } catch (error) {
              throw error;
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  );
}

module.exports = generatePdf;
