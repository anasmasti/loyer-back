const activedirectory = require("activedirectory");
const adConfig = require("../helpers/ad.config");
const User = require("../models/roles/roles.model");

module.exports = {
  findUser: async (_, res, next) => {
    let ad = new activedirectory(adConfig);

    let userMatricule = "badr.azzaby";

    let existedUser = await User.findOne({
      deleted: false,
      userMatricul: userMatricule,
    });

    ad.findUser(userMatricule, function (error, user) {
      if (error) {
        res.status(401).send({ message: error.message });
        return;
      }

      if (!user && !existedUser)
        res.status(404).send({
          message: "l'utilisateur" + userMatricule + "n'a pas aucun accès",
        });
      else {
        res.json({ user, existedUser });
      }
    });
  },
};
