const ReportingLieu = require("../helpers/reporting.lieu");

module.exports = {
  etatLoyerPV: async (req, res) => {
    ReportingLieu.etatLoyer(req, res, "Point de vente")
  },
};
