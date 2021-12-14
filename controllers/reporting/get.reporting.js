const Reporting = require('../../models/reporting/reporting.model')

module.exports = {
    allReporting: async (req, res) => {
        // return console.log(req.body); 
        await Reporting.find({})
            .then((data) => {
                let mois, annee;
                try {
                    // return res.json(data)
                    let requestedReportingPaths = [], responsedData = []
                    for (j in data) {
                        for (k in req.body) {
                            for (let i = 0; i < data[j].reporting_paths.length; i++) {
                                let name = Object.keys(data[j].reporting_paths[i])[0]
                                let path = data[j].reporting_paths[i][name];
                                if (Object.keys(data[j].reporting_paths[i])[0] == req.body[k]) {
                                    requestedReportingPaths.push(data[j].reporting_paths[i])
                                    mois = data[j].mois
                                    annee = data[j].annee
                                }
                            }
                           
                        }
                        // console.log(requestedReportingPaths);
                        responsedData.push({
                            reportingPaths: requestedReportingPaths,
                            mois: mois,
                            annee:annee
                        });
                    }
                    res.json(responsedData)

                } catch (error) {
                    throw error
                }
            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })
    }
}