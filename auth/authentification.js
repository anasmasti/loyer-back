const activedirectory = require("activedirectory");
const adConfig = require("../helpers/ad.config");


module.exports = {
  findUser: async (_, res) => {
    
    let ad = new activedirectory(adConfig);

    let username = "badr.azzaby";

    ad.findUser(username, function (error, user) {
      if (error) {
        res.status(401).send({ message: error.message });
        return;
      }

      if (!user)
        res
          .status(404)
          .send({ message: "l'utilisateur" + username + "n'est pas trouvé" });
      else res.send(user);
    });
  },
};
