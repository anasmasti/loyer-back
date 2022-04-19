const fs = require("fs");
const htmlPdf = require("html-pdf");
const handlebars = require("handlebars");
const moment = require("moment");
const etatPaths = require("../../../models/situation_cloture/etatPaths.schema");
// const storePaths = require("../etat_paths");

async function generatePdf(data, etatType, mois, annee) {
  // return res.json(date)
  date = `${mois}_${annee}`;
  let htmlFileSrouce,
    options,
    reportingPaths = [];
  // let dateToString = moment(today).format('YYYY-MM-DD')
  let today = new Date();
  let dateToString = moment(today).format("YYYY-MM");
  let etatReportingOptions = ["état_des_virements", "état_des_taxes"];

  for (const item in etatReportingOptions) {
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
    `download/generated situation/${etatType}_pdf/${etatType}_${date}.pdf`,
    // `/download/generated situation/etat_virement/etat_virement_${dateToString}.pdf`,
    async function (err, res) {
      if (err) {
        console.error(err);
      } else {
        await etatPaths
          .find({
            mois: mois,
            annee: annee,
          })
          .then(async (data) => {
            try {
              if (data.length == 0) {
                reportingPaths.push({
                  [`${etatType}_${extention}`]: `download/generated situation/${etatType}_${extention}/${etatType}_${date}.${extention}`,
                });
                let etat_paths = new etatPaths({
                  etat_paths: reportingPaths,
                  mois: mois,
                  annee: annee,
                });
                // console.log(etat_paths);
                await etat_paths.save();
              } else {
                // console.log("test 4");
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
                  reportingPaths.push({
                    [`${etatType}_${extention}`]: `download/generated situation/${etatType}_${extention}/${etatType}_${date}.${extention}`,
                  });
                }
                await etatPaths.findOneAndUpdate(
                  { mois: mois, annee: annee },
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
            console.error(error);
          });
      }
    }
  );
}

module.exports = generatePdf;
