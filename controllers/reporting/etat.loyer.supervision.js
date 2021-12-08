const ReportingLieu = require("../helpers/reporting.lieu");

module.exports = {
  etatLoyerSupervision: async (req, res) => {
    ReportingLieu.etatLoyer(req, res, "Supervision")
  },
};
