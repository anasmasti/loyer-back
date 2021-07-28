const Lieu = require('../../models/lieu/lieu.model')
const mongoose = require('mongoose')



module.exports = {

    getAllLieu: async (req, res) => {
        await Lieu.find({ deleted: false })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(400).send({ message: error.message })
            })
    },

    getLieuById: async (req, res) => {
        await Lieu.findById({ _id: req.params.Id })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })
    },
    getAmenagementById: async (req, res) => {
        await Lieu.find({ _id: req.params.IdLieu }, { amenagements: { $elemMatch: { _id: req.params.IdAmng } } })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(404).send({ message: error.message })
            })
    },
    getAllAmenagement: async (req, res) => {
        await Lieu.find({}, {amenagement: { $elemMatch: {deleted: false } } }, { amenagement: 1 })
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
            { $match: {'_id': mongoose.Types.ObjectId(req.params.IdLieu) } },
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
}