const activedirectory = require("activedirectory");
const adConfig = require("../helpers/ad.config");
const ntlm = require('express-ntlm');


module.exports = {
  findUser: async (_, res) => {
    
    
    console.log('ff');

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






