const fs = require('fs');
const htmlPdf = require('html-pdf');
const handlebars = require('handlebars');

async function generatePdf(data, etatReporting) {
  let htmlFileSrouce, options
  let today = new Date();
  let dateToString = moment(today).format('YYYY-MM-DD')
  let etatReportingOptions = [
    "siège",
    "points de vente",
    "supervisions",
    "directions régionales",
    "logements de fonction",
    "aménagements réalisés",
    "locaux fermés",
    "cautions en cours",
    "reprises sur cautions",
    "échéances de contrats",
  ]

  for (const item in etatReportingOptions) {
    if (etatReporting == etatReportingOptions[item]) {
      htmlFileSrouce = fs.readFileSync('./templates/reporting/' + etatReporting + '.html', 'utf8');
      options = { format: 'Letter' };
    }
  }

  let template = handlebars.compile(htmlFileSrouce);
  let htmlToSend = await template(data)

  htmlPdf.create(htmlToSend, options).toFile('C:/Users/HP/Desktop/gestion des loyer-back-end - Comptabilisation/loyer-back-comptabilisation/download/generated reporting/reporting ' + etatReporting+ ' ' + dateToString + '.pdf', function (err, res) {
    if (err)
      return console.log(err);
    console.log(res);
  });
}

module.exports = generatePdf;



