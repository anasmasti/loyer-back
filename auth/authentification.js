// const activedirectory = require("activedirectory");
// const adConfig = require("../helpers/ad.config");
const os = require("os");

module.exports = {
  findUser: async (_, res) => {
    
    let username = os.userInfo().username;
    console.log(username);

    // let ad = new activedirectory(adConfig);

    // let testUsername = "badr.azzaby";

    // ad.findUser(username, function (err, user) {
    //   if (err) {
    //     res.status(401).send({message: err.message})
    //     // console.log("ERROR: " + JSON.stringify(err.message));
    //     return;
    //   }

    //   if (!user)
    //   res.status(404).send({message: "l'utilisateur" + username + "n'est pas trouvé" })
    //     // console.log("User: " + user + " not found.");
    //   else
    //     res.send(user)
    // });
  },
};
