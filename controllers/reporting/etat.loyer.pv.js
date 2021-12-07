const Helper = require("./helper");

module.exports = {
  etatLoyerPV: async (req, res) => {
    Helper.etatLoyer(req, res, "Point de vente")
  },
};
