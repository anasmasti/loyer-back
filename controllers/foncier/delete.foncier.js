const Foncier = require("../../models/foncier/foncier.model");

module.exports = {
  deleteFoncier: async (req, res) => {
    Foncier.findByIdAndUpdate({ _id: req.params.IdFoncier }, { deleted: true })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(422).send({ message: error.message });
      });
  },
};
