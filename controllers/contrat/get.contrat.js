const Contrat = require('../../models/contrat/contrat.model');


module.exports = {
    getContrats: async (req, res) => {
        await Contrat.find({ deleted: false }).populate("lieu", "_id intitule_lieu")
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(402).send({ message: error.message });
            })
    },
    getSelctedContrat: async (req, res) => {
        try {
            const allContrat = await Contrat.findById(req.params.Id).populate("lieu")
            res.json(allContrat);
        } catch (error) {
            res.status(404).send({ message: error.message });
        }
    },
    countContrat: async (req, res) => {
        await Contrat.countDocuments()
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(400).send({ message: error.message })
            })
    }


}