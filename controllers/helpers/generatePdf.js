const fs = require('fs');
const htmlPdf = require('html-pdf');
const handlebars = require('handlebars');
const moment = require('moment')
const Reporting = require('../../models/reporting/reporting.model');
const { paths } = require('../../models/shared/file.schema');

async function generatePdf(data, etatReporting) {
  // return console.log(etatReporting);
  let htmlFileSrouce, options, reportingPaths = []
  let today = new Date();
  let dateToString = moment(today).format('YYYY-MM-DD')
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
  ]

  for (const item in etatReportingOptions) {
    if (etatReporting == etatReportingOptions[item]) {
      htmlFileSrouce = fs.readFileSync('./templates/reporting/' + etatReporting + '.html', 'utf8');
      options = { format: 'Letter' };
    }
  }

  let template = handlebars.compile(htmlFileSrouce);
  let htmlToSend = template(data, {
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true
  })
  // console.log(htmlToSend);
  htmlPdf.create(htmlToSend, options).toFile('download/generated reporting/' + etatReporting + '/reporting ' + etatReporting + ' ' + dateToString + '.pdf',
    async function (err, res) {
      if (err) {
        return console.log(err);
      } else {
        await Reporting.find({ mois: today.getMonth() + 1, annee: today.getFullYear() })
          .then(async (data) => {
            try {
              if (data.length == 0) {
                reportingPaths.push({
                  [etatReporting]: 'download/generated reporting/' + etatReporting + '/reporting ' + etatReporting + ' ' + dateToString + '.pdf'
                })
                let reportings_paths = new Reporting({
                  reporting_paths: reportingPaths,
                  mois: today.getMonth() + 1,
                  annee: today.getFullYear(),
                })
                await reportings_paths.save()
              } else {
                for (let i = 0; i < data[0].reporting_paths.length; i++) {
                  for (j in data[0].reporting_paths[i]) {
                    if (data[0].reporting_paths[i][j] == 'download/generated reporting/' + etatReporting + '/reporting ' + etatReporting + ' ' + dateToString + '.pdf') {
                      reportingPaths.push({
                        [etatReporting]: 'download/generated reporting/' + etatReporting + '/reporting ' + etatReporting + ' ' + dateToString + '.pdf'
                      })
                    } else {
                      reportingPaths.push(data[0].reporting_paths[i])
                    }
                  }
                }
                for (let k = 0; k < reportingPaths.length; k++) {
                  if (Object.keys(reportingPaths[k])[0] != etatReporting) {
                    reportingPaths.push({
                      [etatReporting]: 'download/generated reporting/' + etatReporting + '/reporting ' + etatReporting + ' ' + dateToString + '.pdf'
                    })
                  }
                }

                await Reporting.findOneAndUpdate({ mois: today.getMonth() + 1, annee: today.getFullYear() }, {
                  reporting_paths: reportingPaths,
                  mois: data[0].mois,
                  annee: data[0].annee,
                })
              }
            } catch (error) {
              throw error
            }
          })
          .catch((error) => {
            // res.status(402).send({ message: error.message })
            console.log(error);
          })
      }
    });
}

module.exports = generatePdf;



