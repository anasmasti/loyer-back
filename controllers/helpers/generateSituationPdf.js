const fs = require("fs");
const htmlPdf = require("html-pdf");
const handlebars = require("handlebars");
const moment = require("moment");
const etatPaths = require("../../models/situation_cloture/etatPaths");

async function generatePdf(data1, etatType) {
  let data = data1[0];
  let htmlFileSrouce,
    options,
    reportingPaths = [];
  let today = new Date();
  // let dateToString = moment(today).format('YYYY-MM-DD')
  let dateToString = moment(today).format("YYYY-MM");
  let etatReportingOptions = ["etat_virement", "Etat taxes"];

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

  htmlPdf
    .create(htmlToSend, options)
    .toFile(
      "download/generated situation cloture/" +
        etatType +
        "/" +
        etatType +
        " " +
        dateToString +
        ".pdf",
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
              try {
                if (data.length == 0) {
                  reportingPaths.push({
                    [etatType]:
                      "download/generated situation/" +
                      etatType +
                      "/" +
                      etatType +
                      " " +
                      dateToString +
                      ".pdf",
                  });
                  let etat_paths = new etatPaths({
                    etat_paths: reportingPaths,
                    mois: today.getMonth() + 1,
                    annee: today.getFullYear(),
                  });
                  await etat_paths.save();
                } else {
                  for (let i = 0; i < data[0].etat_paths.length; i++) {
                    for (j in data[0].etat_paths[i]) {
                      if (
                        data[0].etat_paths[i][j] ==
                        "download/generated situation/" +
                          etatType +
                          "/" +
                          etatType +
                          " " +
                          dateToString +
                          ".pdf"
                      ) {
                        reportingPaths.push({
                          [etatType]:
                            "download/generated situation/" +
                            etatType +
                            "/" +
                            etatType +
                            " " +
                            dateToString +
                            ".pdf",
                        });
                      } else {
                        reportingPaths.push(data[0].etat_paths[i]);
                      }
                    }
                  }

                  let pathExist = false;
                  for (let k = 0; k < reportingPaths.length; k++) {
                    if (Object.keys(reportingPaths[k])[0] == etatType) {
                      pathExist = true;
                    }
                  }

                  if (pathExist == false) {
                    reportingPaths.push({
                      [etatType]:
                        "download/generated situation/" +
                        etatType +
                        "/" +
                        etatType +
                        " " +
                        dateToString +
                        ".pdf",
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
              // res.status(402).send({ message: error.message })
              console.log(error);
            });
        }
      }
    );
}

module.exports = generatePdf;
