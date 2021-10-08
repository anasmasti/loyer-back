const Contrat = require('../../models/contrat/contrat.model')
const loyerArchive = require('../../models/archive/archiveComptabilisationLoyer.schema')

module.exports = {
    clotureDuMois: async (req, res) => {
        let loyerArray = [];
        let today = new Date()
        await Contrat.find({ deleted: false })
            .then(async (data) => {
                for (let index = 0; index < data.length; index++) {
                    let dataToString = JSON.stringify(JSON.stringify(data[index]))
                    loyerArray.push(dataToString)
                }
                const archiveLoyer = new loyerArchive({
                    archiveComptabilisationLoyer: loyerArray,
                    mois: today.getMonth() + 1,
                    annee: today.getFullYear()
                })
                await archiveLoyer.save().then((data) => {
                    res.json(data)
                })
                    .catch((error) => {
                        res.status(403).send({ message: error.message })
                    })
            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })
    }
}