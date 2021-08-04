const Foncier = require('../../models/foncier/foncier.model')

module.exports = {

    deleteFoncier: async (req, res) => {
        await Foncier.findByIdAndUpdate(req.params.Id, {
            deleted: true
        }, { new: true })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(404).send({ message: error.message })
            })
    }
}