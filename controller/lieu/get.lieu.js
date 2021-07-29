const Lieu = require('../../models/lieu/lieu.model')
const mongoose = require('mongoose')



module.exports = {
    
    //get all lieus
    getAllLieu: async (req, res) => {
        await Lieu.find({ deleted: false })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(400).send({ message: error.message })
            })
    },

    // get Lieu by Id
    getLieuById: async (req, res) => {
        await Lieu.findById({ _id: req.params.Id })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })
    },

    //get amenagements by Id
    getAmenagementById: async (req, res) => {
        await Lieu.find({ _id: req.params.IdLieu }, { amenagements: { $elemMatch: { _id: req.params.IdAmng } } })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(404).send({ message: error.message })
            })
    },

    //get all amenagements that has deleted false
    getAllAmenagement: async (req, res) => {
        await Lieu.find({}, { amenagement: { $elemMatch: { deleted: false } } }, { amenagement: 1 })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(404).send({ message: error.message })
            })
    },

    //get not deleted fournisseurs of a Lieu ID 
    getFournisseursOfLieu: async (req, res) => {
        await Lieu.aggregate([
            { $match: { '_id': mongoose.Types.ObjectId(req.params.IdLieu) } },
            { $unwind: '$amenagement' },
            { $match: { 'amenagement.deleted': false } },
            { $unwind: '$amenagement.fournisseur' },
            { $match: { 'amenagement.fournisseur.deleted': false } },
            { $project: { 'amenagement.fournisseur': 1 } }
        ])
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(404).send({ message: error.message })
            })
    },

    //get all Directions regionals and Supervision
    getAllDirectionsAndSupervions: async (req, res) => {
        try {
            const DR = await Lieu.find({ type_lieu: 'Direction régionale' })

            const SUP = await Lieu.find({ type_lieu: 'Supervision' })

            res.json({
                DR,
                SUP
            })

        } catch (error) {
            res.status(404).send({ message: error.message })
        }
    },
    
    // get coute lieu
    getCountLieu: async (req, res) => {
        await Lieu.countDocuments({ deleted: false })
            .then(data => {
                res.json(data)
            })
            .catch(error => {
                res.status(402).send({ message: error.message })
            })
    }
}