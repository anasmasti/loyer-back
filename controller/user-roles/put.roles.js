const userRoles = require('../../models/roles/roles.model')

module.exports = {
    updateUserRoles: async (req, res) => {
        console.log(req.body);
        let item = 0;
        let allUserRoles = []
        for (item in req.body.userRoles) {
            await allUserRoles.push({
                roleName: req.body.userRoles[item].roleName,
                deleted:req.body.userRoles[item].deleted
            })
        }
        await userRoles.findByIdAndUpdate(req.params.Id,
            {
                userMatricul: req.body.userMatricul,
                nom: req.body.nom,
                prenom: req.body.prenom,
                userRoles: allUserRoles,
                deleted:req.body.deleted
            })
            .then((data) => {
                res.json(data)
            })
            .catch((error => {
                res.status(400).send({ message: error.message } || "Can't Update User Roles")
            }))
    }
}