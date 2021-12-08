const Reporting = require('../../models/reporting/reporting.model')

//************************** */
//lieu
// "siège",
// "points_de_vente",
// "supervisions",
// "directions_régionales",
// "logements_de_fonction",
//************************** */
//foncier
// "aménagements_réalisés",
// "locaux_fermés",
//************************** */
//contrat
// "cautions_en_cours",
// "reprises_sur_cautions",
// "échéances_de_contrats",

module.exports = {
    allReporting: async (req, res) => {
        // return console.log(req.body); 
        await Reporting.find({})
            .then((data) => {
                let mois, annee;
                // return res.json(data)
                let requestedReportingPaths = [], responsedData = []
                for (j in data) {
                    for (k in req.body) {
                        for (let i = 0; i < data[j].reporting_paths.length; i++) {
                            let name = Object.keys(data[j].reporting_paths[i])[0]
                            let path = data[j].reporting_paths[i][name];
                            // if (Object.keys(data[j].reporting_paths[i])[0] == req.body[k]) {
                            //     data[j].reporting_paths[i]
                            //     requestedReportingPaths.push({
                            //         path: path,
                            //         type: 
                            //         mois = data[j].mois,
                            //         annee = data[j].annee
                            //     })
                            // }
                        }

                    }
                    responsedData.push({
                        reportingPaths: requestedReportingPaths,
                        mois: mois,
                        annee: annee
                    });
                    requestedReportingPaths = [];
                }
                res.json(responsedData)


            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })
    }
}