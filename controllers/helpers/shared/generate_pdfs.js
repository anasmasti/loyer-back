const fs = require("fs");
const htmlPdf = require("html-pdf");
const handlebars = require("handlebars");
const moment = require("moment");
const etatPaths = require("../../../models/situation_cloture/etatPaths.schema");
const Reporting = require("../../../models/reporting/reporting.model");

module.exports = {
  generateSituationPdf: async (data, etatType, mois, annee) => {
    date = `${mois}_${annee}`;
    let htmlFileSrouce,
      options,
      reportingPaths = [];
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
          orientation: "landscape",
          base: "file://" + __dirname + "/public/images/",
        };
      }
    }
    handlebars.registerHelper("ifCondFalse", function (v1, options) {
      if (v1 === false) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
    handlebars.registerHelper("ifCondTrue", function (v1, options) {
      if (v1 === true) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
    let template = handlebars.compile(htmlFileSrouce);
    let htmlToSend = template(data, {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
    });
    let extention = "pdf";
    htmlPdf
      .create(htmlToSend, options)
      .toFile(
        `download/generated situation/${etatType}_pdf/${etatType}_${date}.pdf`,
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
                    await etat_paths.save();
                  } else {
                    for (let i = 0; i < data[0].etat_paths.length; i++) {
                      reportingPaths.push(data[0].etat_paths[i]);
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
  },

  generateReportingPdf: async (data, reportingType) => {
    let htmlFileSrouce,
      options,
      reportingPaths = [];
    let today = new Date();
    // let dateToString = moment(today).format('YYYY-MM-DD')
    let dateToString = moment(today).format("YYYY-MM");
    let etatReportingOptions = [
      "siège",
      "points_de_vente",
      "supervisions",
      "directions_régionales",
      "logements_de_fonction",
      "aménagements_réalisés",
      "locaux_fermés",
      "cautions_en_cours",
      "reprises_sur_cautions",
      "échéances_de_contrats",
    ];

    for (const item in etatReportingOptions) {
      if (reportingType == etatReportingOptions[item]) {
        htmlFileSrouce = fs.readFileSync(
          "./templates/reporting/" + reportingType + ".html",
          "utf8"
        );
        options = {
          format: "A4",
          orientation: "landscape",
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
        "download/generated reporting/" +
          reportingType +
          "/reporting " +
          reportingType +
          " " +
          dateToString +
          ".pdf",
        async function (err, res) {
          if (err) {
            console.error(err);
          } else {
            await Reporting.find({
              mois: today.getMonth() + 1,
              annee: today.getFullYear(),
            })
              .then(async (data) => {
                try {
                  if (data.length == 0) {
                    reportingPaths.push({
                      [reportingType]:
                        "download/generated reporting/" +
                        reportingType +
                        "/reporting " +
                        reportingType +
                        " " +
                        dateToString +
                        ".pdf",
                    });
                    let reportings_paths = new Reporting({
                      reporting_paths: reportingPaths,
                      mois: today.getMonth() + 1,
                      annee: today.getFullYear(),
                    });
                    await reportings_paths.save();
                  } else {
                    for (let i = 0; i < data[0].reporting_paths.length; i++) {
                      for (j in data[0].reporting_paths[i]) {
                        if (
                          data[0].reporting_paths[i][j] ==
                          "download/generated reporting/" +
                            reportingType +
                            "/reporting " +
                            reportingType +
                            " " +
                            dateToString +
                            ".pdf"
                        ) {
                          reportingPaths.push({
                            [reportingType]:
                              "download/generated reporting/" +
                              reportingType +
                              "/reporting " +
                              reportingType +
                              " " +
                              dateToString +
                              ".pdf",
                          });
                        } else {
                          reportingPaths.push(data[0].reporting_paths[i]);
                        }
                      }
                    }

                    let pathExist = false;
                    for (let k = 0; k < reportingPaths.length; k++) {
                      if (Object.keys(reportingPaths[k])[0] == reportingType) {
                        pathExist = true;
                      }
                    }

                    if (pathExist == false) {
                      reportingPaths.push({
                        [reportingType]:
                          "download/generated reporting/" +
                          reportingType +
                          "/reporting " +
                          reportingType +
                          " " +
                          dateToString +
                          ".pdf",
                      });
                    }

                    await Reporting.findOneAndUpdate(
                      {
                        mois: today.getMonth() + 1,
                        annee: today.getFullYear(),
                      },
                      {
                        reporting_paths: reportingPaths,
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
                console.error(error);
              });
          }
        }
      );
  },
};
