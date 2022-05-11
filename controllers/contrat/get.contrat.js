const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  getAllContrats: async (req, res) => {
    await Contrat.find({ deleted: false })
      .populate({
        path: "proprietaires",
        populate: [
          { path: "proprietaire", match: { deleted: false } },
          {
            path: "has_mandataire",
            populate: { path: "proprietaire", match: { deleted: false } },
            match: { deleted: false },
          },
          { path: "proprietaire_list", match: { deleted: false } },
        ],
        match: { deleted: false },
      })
      .populate({
        path: "foncier",
        populate: {
          path: "lieu",
          populate: { path: "lieu" },
          match: { deleted: false },
        },
      })
      .sort({ updatedAt: "desc" })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },
  getDetailContrat: async (req, res) => {
    await Contrat.findById(req.params.Id)
      .populate("proprietaires")
      .populate("foncier")
      .populate({
        path: "old_contrat",
        populate: {
          path: "contrat",
          match: { deleted: false },
          select: "montant_loyer numero_contrat",
        },
      })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(404).send({ message: error.message });
      });
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
