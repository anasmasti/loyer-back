const activedirectory = require("activedirectory");
const adConfig = require("../helpers/ad.config");
const User = require("../models/roles/roles.model");

module.exports = {
  findUser: async (req, res, next) => {
    // let ad = new activedirectory(adConfig);
    // let userMatricule = "badr.azzaby";
    
    try {

      let existedUser = await User.findOne({ userMatricul: req.params.matricule, deleted: false});
      
      if (existedUser) {
        res.json({
          isLogged: true,
          existedUser
        })
      }
    } catch (error) {
      res.status(402).send({message: error.message})
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
