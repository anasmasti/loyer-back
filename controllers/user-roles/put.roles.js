const userRoles = require("../../models/roles/roles.model");

module.exports = {
  updateUserRoles: async (req, res) => {
    let item = 0;
    let allUserRoles = [];

    for (item in req.body.userRoles) {
      allUserRoles.push({
        roleName: req.body.userRoles[item].roleName,
        roleCode:
          req.body.userRoles[item].roleName ==
          "Chargé de suivi des loyers et aménagements".trim()
            ? "CSLA"
            : req.body.userRoles[item].roleName ==
              "Chef de Département Gestion et Suivi du Patrimoine".trim()
            ? "CDGSP"
            : req.body.userRoles[item].roleName ==
              "Direction Affaires Juridiques et Conformité".trim()
            ? "DAJC"
            : req.body.userRoles[item].roleName ==
              "Département Comptable".trim()
            ? "DC"
            : "Admin"
            ? "Admin".trim()
            : "",
        deleted: req.body.userRoles[item].deleted,
      });
    }
    await userRoles
      .findByIdAndUpdate(req.params.Id, {
        userMatricul: req.body.userMatricul,
        nom: req.body.nom,
        prenom: req.body.prenom,
        userRoles: allUserRoles,
        email: req.body.email,
        deleted: req.body.deleted,
        password: req.body.password,
      })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res
          .status(400)
          .send({ message: error.message } || "Can't Update User Roles");
      });
  },

  updateProfile: async (req, res) => {
    let user = req.body;

    let updatedUser = {
      nom: user.nom,
      prenom: user.nom,
      email: user.email,
      password: user.password,
    };
    
    console.log(updatedUser);

    userRoles
      .findByIdAndUpdate({ _id: req.params.Id }, updatedUser)
      .then(async (data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(400).send({ message: error.message });
      });
  },
};
