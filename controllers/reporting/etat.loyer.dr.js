const ReportingLieu = require("../helpers/reporting.lieu");

module.exports = {
  etatLoyerDR: async (req, res) => {
    ReportingLieu.etatLoyer(req, res, "Direction régionale")
  },
};
