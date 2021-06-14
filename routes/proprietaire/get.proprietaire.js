const Proprietaire = require('../../models/proprietaire.model')

module.exports = {

    //Chercher touts les propriétaires
    GetAllProprietaire: async (req, res) => {
        await Proprietaire.find({ deleted: false })
            .then((data) => {
                res.send(data)
            })
            .catch((error) => {
                res.status(200).send({ message: `Aucun Propriétaire trouvé` || error })
            })
    },

    //Chercher propriétaires par ID
    GetProprietairePerID: async (req, res) => {
        await Proprietaire.findById(req.params.Id)
            .then((data) => {
                res.send(data)
            })
            .catch((error) => {
                res.status(500).send({ message: `Aucun Propriétaire trouvé` || error })
            })
    },

}
