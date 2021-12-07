const Helper = require("./helper");

module.exports = {
  etatLoyerSupervision: async (req, res) => {
    Helper.etatLoyer(req, res, "Supervision")
  },
};
