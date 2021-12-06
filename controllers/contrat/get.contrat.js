const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  getAllContrats: async (req, res) => {
    await Contrat.find({ deleted: false })
      .populate("foncier", "_id intitule_lieu")
      .populate({ path: "foncier", populate: { path: "proprietaire", populate:{ path: "proprietaire_list" }  } })
      .sort({ updatedAt: "desc" })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },
  getDetailContrat: async (req, res) => {
     await Contrat.findById(req.params.Id).populate("foncier")
     .then((data) => {
      res.json(data);
     })
     .catch((error) => {
       res.status(404).send({ message: error.message });
     })
  },
  countContrat: async (req, res) => {
    await Contrat.countDocuments()
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(400).send({ message: error.message });
      });
  },
};
