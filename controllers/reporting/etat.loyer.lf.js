const ReportingLieu = require("../helpers/reporting.lieu");

module.exports = {
  etatLoyerLF: async (req, res) => {
    ReportingLieu.etatLoyer(req, res, "Logement de fonction")
  },
};
