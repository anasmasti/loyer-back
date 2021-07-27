const Lieu = require('../../models/lieu/lieu.model')



module.exports = {

    getAllLieu: async (req, res) => {
        await Lieu.find({deleted: false})
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(400).send({message: error.message})
            })
    },

    getLieuById: async (req, res)=> {
        await Lieu.findById(req.params.Id)
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(402).send({message: error.message})
            })
    },
    getAmenagementById: async (req, res) => {
      await Lieu.find({_id: req.params.IdLieu},{amenagements:{$elemMatch:{_id: req.params.IdAmng}}})
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(404).send({message: error.message})
        })
    },
    getAllAmenagement: async (req, res) => {
        console.log(req.params.Id);
      await Lieu.find({}).select({amenagements: 1,type})
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(404).send({message: error.message})
        })
    }
}