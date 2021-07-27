const Lieu = require('../../models/lieu/lieu.model')

module.exports = {
    deletedLieu: async (req, res) => {
        await Lieu.findByIdAndUpdate({_id: req.params.Id},{
            deleted: true
        })
    }
}