const User = require("../models/roles/roles.model");

module.exports = {
  checkRoles: (...roles) => {
    return async (req, res, next) => {
      let roleExist = false;
      let authenticatedUser = await User.findOne({
        userMatricul: req.params.matricule,
      });
      if (authenticatedUser) {
        for (let i = 0; i < authenticatedUser.userRoles.length; i++) {
          if (
            authenticatedUser.userRoles[i].roleCode == roles[0] ||
            authenticatedUser.userRoles[i].roleCode == roles[1] ||
            authenticatedUser.userRoles[i].roleCode == roles[2]
          ) {
            roleExist = true;
          }
        }
        if (roleExist) {
          next();
        } else {
          res
            .status(401)
            .send({
              message:
                "Votre rôle ne vous donne pas l'accès à utiliser cette fonctionnalité.",
            });
        }
      } else {
        res
          .status(402)
          .send({ message: "Accès refusé, vous devez s'identifier d'abord" });
      }
    };
  },
};
