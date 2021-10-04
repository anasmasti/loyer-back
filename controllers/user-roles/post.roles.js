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
      res.status(409).send({ message: "le matricule est déja exist" });
      return;
    }

    for (item in req.body.userRoles) {
      allUserRoles.push({
        roleName: req.body.userRoles[item].roleName,
        roleCode: req.body.userRoles[item].roleName == 'Chargé de suivi des loyers et aménagements' ? 'CSLA'
          : req.body.userRoles[item].roleName == 'Chef de Département Gestion et Suivi du Patrimoine' ? 'CDGSP'
            : req.body.userRoles[item].roleName == 'Direction Affaires Juridiques et Conformité ' ? 'DAJC'
              : req.body.userRoles[item].roleName == 'Département Comptable ' ? 'DC'
                : ''
      });
    }
    const userR = new userRoles({
      userMatricul: req.body.userMatricul,
      nom: req.body.nom,
      prenom: req.body.prenom,
      userRoles: allUserRoles,
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
