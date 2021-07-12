const userRoles = require('../../models/roles/roles.model') 

module.exports = {

    getAllUserRoles: async (req, res) => {
        await userRoles.find()
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(404).send({message: error.message} || 'cant get all userRoles')
            })
    },

    getUserRolesPerId: async (req, res) => {
        await userRoles.findById(req.params.Id) 
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(404).send({message: error.message} || 'cant get userRoles per ID')
            })
    }
}