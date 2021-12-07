const Helper = require("./helper");

module.exports = {
  etatLoyerDR: async (req, res) => {
    Helper.etatLoyer(req, res, "Direction régionale")
  },
};
