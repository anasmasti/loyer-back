const userRoles = require("../../models/roles/roles.model");

module.exports = {
  addUserRoles: async (req, res) => {
    let item = 0;
    let allUserRoles = [];
    let matriculExist = await userRoles.findOne({
      deleted: false,
      userMatricul: req.body.userMatricul,
    });

    if (matriculExist) {
      res.status(409).send({ message: "le matricule est déja existe" });
      return;
    }
    
    for (item in req.body.userRoles) {
      allUserRoles.push({
        roleName: req.body.userRoles[item].roleName,
        roleCode: req.body.userRoles[item].roleName == 'Chargé de suivi des loyers et aménagements'.trim() ? 'CSLA'
          : req.body.userRoles[item].roleName == 'Chef de Département Gestion et Suivi du Patrimoine'.trim() ? 'CDGSP'
            : req.body.userRoles[item].roleName == 'Direction Affaires Juridiques et Conformité'.trim() ? 'DAJC'
              : req.body.userRoles[item].roleName == 'Département Comptable'.trim() ? 'DC'
                : req.body.userRoles[item].roleName == 'Admin'.trim() ? 'Admin' : ''
      });
    }
    const userR = new userRoles({
      userMatricul: req.body.userMatricul,
      nom: req.body.nom,
      prenom: req.body.prenom,
      code_dr: req.body.code_dr,
      userRoles: allUserRoles,
      password: ""
    });
    await userR
      .save()
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res
          .status(400)
          .json({ message: error.message } || "Can't Post User Roles");
      });
  },
};
