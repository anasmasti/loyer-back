const Proprietaire = require('../../models/proprietaire/proprietaire.model')

module.exports = {

    //Chercher touts les propriétaires
    getAllProprietaire: async (req, res) => {
        await Proprietaire.find({ deleted: false })
            .then((data) => {
                res.send(data)
            })
            .catch((error) => {
                res.status(200).send({ message: `Aucun Propriétaire trouvé` || error })
            })
    },

    //Chercher propriétaires par ID
    getProprietairePerID: async (req, res) => {
        await Proprietaire.findById(req.params.Id)
            .then((data) => {
                res.send(data)
            })
            .catch((error) => {
                res.status(500).send({ message: `Aucun Propriétaire trouvé` || error })
            })
    },

    getCountProprietaire: async (req, res) => {
        await Proprietaire.countDocuments({deleted: false})
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(402).send({message: error.message})
            })
    }

}
