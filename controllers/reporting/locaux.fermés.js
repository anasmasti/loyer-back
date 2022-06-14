const Foncier = require('../../models/foncier/foncier.model');
const generatePdfs = require("../helpers/shared/generate_pdfs");

module.exports = {
    locauxFermesReporting: async (req, res) => {
        await Foncier.aggregate([
            { "$match": { "lieu.deleted": true } },
            {
                "$redact": {
                    "$cond": {
                        "if": {
                            "$allElementsTrue": {
                                "$map": {
                                    "input": "$lieu",
                                    "as": "lieumap",
                                    "in": { "$eq": ["$$lieumap.deleted", true] }
                                }
                            }
                        },
                        "then": "$$KEEP",
                        "else": "$$PRUNE"
                    }
                }
            }
        ])
            .then((data) => {
                res.json(data)
                generatePdfs.generateReportingPdf(data , 'locaux_fermés')
            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })
    }
}