const Proprietaire = require('../../models/proprietaire/proprietaire.model')
const Lieu = require('../../models/lieu/lieu.model')
const Foncier = require('../../models/foncier/foncier.model')
const Contrat = require('../../models/contrat/contrat.model')

module.exports = {
    countAll: async (req, res) => {
        try {
            const countProprietaire = await Proprietaire.countDocuments()
            const countLieu = await Lieu.countDocuments()
            const countFoncier = await Foncier.countDocuments()
            const countContrat = await Contrat.countDocuments()

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