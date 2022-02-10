const Lieu = require("../../models/lieu/lieu.model");
const mongoose = require("mongoose");
const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  //get all lieu
  getAllLieu: async (_, res) => {
    await Lieu.find({ deleted: false })
      .sort({ updatedAt: "desc" })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  },

  //get lieu by Id
  getLieuById: async (req, res) => {
    await Lieu.findById({ _id: req.params.Id })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  },

  //get all Directions regionals and Supervision
  getAllDirectionsAndSupervions: async (_, res) => {
    try {
      const DR = await Lieu.find(
        { type_lieu: "Direction régionale", deleted: false },
        { _id: 1, code_lieu: 1, intitule_lieu: 1 }
      );

      const SUP = await Lieu.find(
        { type_lieu: "Supervision", deleted: false },
        { _id: 0, code_lieu: 1, intitule_lieu: 1,code_rattache_DR: 1 }
      );

      res.json({
        DR,
        SUP,
      });
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  },

  // get coute lieu
  getCountLieu: async (_, res) => {
    await Lieu.countDocuments({ deleted: false })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },
  // get lieu by contrat
  getContratByLieu: async (req, res) => {
    var _id = mongoose.Types.ObjectId(req.params.Id);
    await Contrat.findOne({ foncier: _id, deleted: false })
      .populate({ path: "foncier", populate: { path: "proprietaire" } })
      .then((data) => {
        res.json([data]);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },
};
