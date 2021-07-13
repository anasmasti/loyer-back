const userRoles = require('../../models/roles/roles.model') 

module.exports = {
    addUserRoles: async(req, res) => {
        
        let item = 0;
        let allUserRoles = []

        for(item in req.body.userRoles) {
           await allUserRoles.push({
               roleName: req.body.userRoles[item].roleName
            })
        }
        const userR = new userRoles({
            userMatricul : req.body.userMatricul,
            name: req.body.nom,
            prenom: req.body.prenom,
            userRoles : allUserRoles
        })
        await userR.save()
            .then((data) => {
                res.json(data)
            })
            .catch((error => {
                res.status(400).json({message: error.message} || "Can't Post User Roles")
            }))
    }
}