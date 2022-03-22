const mongoose = require("mongoose");
const Lieu = require("../../models/lieu/lieu.model");
const Foncier = require("../../models/foncier/foncier.model");
const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  //get all lieu
  getAllLieu: async (_, res) => {
    await Lieu.find({ deleted: false })
      .populate({ path: "attached_DR", select: "intitule_lieu code_lieu" })
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
      .populate({ path: "attached_DR", select: "intitule_lieu code_lieu" })
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
        { _id: 0, code_lieu: 1, intitule_lieu: 1, code_rattache_DR: 1 }
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
      .populate({
        path: "foncier",
        populate: { path: "proprietaire", match: { deleted: false } },
      })
      .then((data) => {
        res.json([data]);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },

  getLieuByType: async (req, res) => {
    let lieuByType = [];
    Lieu.find({ deleted: false, type_lieu: req.body.type_lieu })
      .populate({ path: "attached_DR", select: "intitule_lieu code_lieu" })
      .then(async (data) => {
        data.forEach(async (lieu) => {
          const usedLieu = await Foncier.find({
            deleted: false,
            "lieu.deleted": false,
            "lieu.lieu": lieu._id,
          });
          if (usedLieu.length == 0) {
            lieuByType.push(lieu);
          }
        });
        setTimeout(() => {
          // if (lieuByType.length > 0) {
          res.json(lieuByType);
          // }
        }, 1000);
      });
  },

  // getLieuByType: async (req, res) => {
  //   await Lieu.find({ deleted: false, type_lieu: req.body.type_lieu }).then(
  //     async (data) => {
  //       // res.json(data)
  //       if (data) {
  //         let arr = [];
  //         for (let index = 0; index < data.length; index++) {
  //           const usedLieu = await Foncier.find({
  //             deleted: false,
  //             "lieu.deleted": false,
  //             "lieu.lieu": data[index]._id,
  //           });

  //           if (usedLieu.length == 0 ) {
  //             arr.push(data[index]);
  //           }
  //           res.json([arr]);
  //         }
  //       // data.forEach(async (lieu) => {

  //       //   });

  //       }

  //       // await  myPromise.then(data => res.json(data));
  //     }
  //   );
  // },

  getUnusedLieu: async (req, res) => {
    let lieuByType = [];
    Lieu.find({ deleted: false, type_lieu: req.body.type_lieu })
      .populate({ path: "attached_DR", select: "intitule_lieu code_lieu" })
      .then(async (data) => {
        data.forEach(async (lieu) => {
          const usedLieu = await Lieu.find({
            deleted: false,
            code_rattache_DR: lieu.code_lieu,
          });
          if (usedLieu.length == 0) {
            lieuByType.push(lieu);
          }
        });
        setTimeout(() => {
          res.json(lieuByType);
        }, 1000);
      });
  },
};
