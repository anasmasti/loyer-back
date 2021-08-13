const Foncier = require('../../models/foncier/foncier.model')

module.exports = {
    allFoncier: async (req, res) => {
        await Foncier.find({deleted: false})
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(404).send({message: error.message})
            })
    },
    foncierById: async (req, res) => {
        await Foncier.findById(req.params.Id)
        .then((data)=> {
            res.json(data)
        })
        .catch((error) => {
            res.status(404).send({message: error.message})
        })
    },
    foncierCount: async (req, res) => {

    }
}