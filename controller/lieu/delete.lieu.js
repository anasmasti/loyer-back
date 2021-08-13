const Lieu = require('../../models/lieu/lieu.model')

module.exports = {
    deletedLieu: async (req, res) => {
        await Lieu.findByIdAndUpdate({_id: req.params.Id},{
            deleted: true
        }, {new: true})
        .then((data) => {
            res.json('has been deleted')
        })
        .catch((error) => {
            res.status(403).send({message: error.message})
        })
    
    }
}