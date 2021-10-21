const activedirectory = require("activedirectory");
const adConfig = require("../helpers/ad.config");
const User = require("../models/roles/roles.model");

module.exports = {
  findUser: async (req, res, next) => {
    // let ad = new activedirectory(adConfig);
    // let userMatricule = "badr.azzaby";

    let existedUser = await User.findOne({ userMatricul: req.body.matricule, deleted: false })
    

    if (existedUser == null) {
      return res.status(401).send({ message: "L'utilisateur n'existe pas" });
    }

    if (existedUser.password.trim() === "") {
      await User.findOneAndUpdate({ userMatricul: req.body.matricule, deleted: false }, { password: req.body.password })
    }

    let fullUser = await User.findOne({userMatricul: req.body.matricule , deleted: false})

    if (fullUser.userMatricul == req.body.matricule && fullUser.password == req.body.password) {
      res.json({
        isLogged: true,
        existedUser
      })
    } else {
      res.status(400).send({ message: 'Matricule ou mot de passe incorrect. Veuillez réessayer.' })
    }

    // ad.findUser(userMatricule, function (error, user) {
    //   if (error) {
    //     res.status(401).send({ message: error.message });
    //     return;
    //   }

    //   if (!user && !existedUser)
    //     res.status(404).send({
    //       message: "l'utilisateur" + userMatricule + "n'a pas aucun accès",
    //     });
    //   else {
    //     res.json({ user, existedUser });
    //   }
    // });
  },
};
