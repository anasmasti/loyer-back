const Foncier = require("../../models/foncier/foncier.model");

module.exports = {
  getAllFoncier: async (_, res) => {
    Foncier.find()
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(422).send({ message: error.message });
      });
  },

  getFoncierById: async (req, res) => {
    Foncier.findById({ _id: req.params.IdFoncier })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(422).send({ message: error.message });
      });
  },
};
