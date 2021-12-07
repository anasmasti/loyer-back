const ReportingLieu = require("../helpers/reporting.lieu");

module.exports = {
  etatLoyerSiege: async (req, res) => {
    ReportingLieu.etatLoyer(req, res, "siège")
  },
};
