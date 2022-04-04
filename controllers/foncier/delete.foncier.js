const Foncier = require("../../models/foncier/foncier.model");

module.exports = {
  deleteFoncier: async (req, res) => {
    Foncier.findOne({ _id: req.params.IdFoncier })
      .then((data) => {
        if (data.contrat != null && data.proprietaire.length > 0) {
          res.status(422).send({ message: "Ce local contient un contrat" });
        } else {
          Foncier.findByIdAndUpdate(
            { _id: req.params.IdFoncier },
            { deleted: true }
          )
            .then((data) => {
              res.json(data);
            })
            .catch((error) => {
              res.status(422).send({ message: error.message });
            });
        }
      }).catch((error) => {
          res.status(422).send({ message: error.message });
      })
  },
};
