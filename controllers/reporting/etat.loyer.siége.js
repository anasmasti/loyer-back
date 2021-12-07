const Helper = require("./helper");

module.exports = {
  etatLoyerSiege: async (req, res) => {
    Helper.etatLoyer(req, res, "siège")
  },
};
