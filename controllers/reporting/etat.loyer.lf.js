const Helper = require("./helper");

module.exports = {
  etatLoyerLF: async (req, res) => {
    Helper.etatLoyer(req, res, "Logement de fonction")
  },
};
