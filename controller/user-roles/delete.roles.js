const userRoles = require('../../models/roles/roles.model') 


module.exports = {
    DeleteRoles: async (req, res) => {
        await userRoles.findByIdAndUpdate(req.params.Id, {
            deleted: req.body.deleted
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(402).send({message: error.message} || "can't delete userRoles")
        })
    }
}