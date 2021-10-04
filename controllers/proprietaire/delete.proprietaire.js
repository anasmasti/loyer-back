const Proprietaire = require('../../models/proprietaire/proprietaire.model')

module.exports = {

    //Supprimer propriétaires par ID
    deleteProprietaire: async (req, res) => {
        await Proprietaire.findByIdAndUpdate(req.params.Id, {
            deleted: req.body.deleted
        })
            .then(() => {
                res.send({ message: "Deleted" })
            })
            .catch(error => {
                res.status(400).send({ message: `Error de suppression le propriétaire` || error.message })
            })
    },

}

