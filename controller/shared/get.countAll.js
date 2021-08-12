const Proprietaire = require('../../models/proprietaire/proprietaire.model')
const Lieu = require('../../models/lieu/lieu.model')
const Foncier = require('../../models/foncier/foncier.model')
const Contrat = require('../../models/contrat/contrat.model')

module.exports = {
    countAll: async (req, res) => {
        try {
            const countProprietaire = await Proprietaire.countDocuments({deleted: false})
            const countLieu = await Lieu.countDocuments({deleted: false})
            const countFoncier = await Foncier.countDocuments({deleted: false})
            const countContrat = await Contrat.countDocuments({deleted: false})

            res.json({
                countProprietaire,
                countLieu,
                countFoncier,
                countContrat
            })

        } catch (error) {
            res.status(404).send({message: error.message})
        }
    }
}