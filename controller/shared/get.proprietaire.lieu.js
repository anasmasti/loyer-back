const Proprietaire = require('../../models/proprietaire/proprietaire.model')
const Lieu = require('../../models/lieu/lieu.model')

module.exports = {
    getProprietaireAndLieu: async (req, res) => {
        try {
            const proprietaire = await Proprietaire.find({deleted: false}, { _id: 1, cin:1 })

            const lieu = await Lieu.find({ deleted: false}, { _id: 1, code_lieu:1 })

            res.json({
                proprietaire,
                lieu
            })
        } catch (error) {
            res.status(403).send({message: error.message})
        }
    }
}