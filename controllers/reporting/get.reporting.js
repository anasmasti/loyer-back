const Reporting = require('../../models/reporting/reporting.model')

module.exports = {
    allReporting: async (_, res) => {
        await Reporting.find({})
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })
    }
}