const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const Foncier = require("../../models/foncier/foncier.model");
const Lieu = require("../../models/lieu/lieu.model");
const Contrat = require("../../models/contrat/contrat.model");
const AffectationProprietaire = require("../../models/affectation_proprietaire/affectation_proprietaire.schema");

module.exports = {
  //Chercher touts les propriétaires
  getAllProprietaire: async (req, res) => {
    await Proprietaire.find({ deleted: false })
      .populate({ path: "proprietaire_list" })
      .sort({ updatedAt: "desc" })
      .then(async (requestedProprietaires) => {
        const promise = new Promise((resolve, reject) => {
          let proprietaires = [];
          requestedProprietaires.forEach(async (proprietaire, index) => {
            await AffectationProprietaire.find({
              proprietaire: proprietaire._id,
              deleted: false,
            })
              .then((data) => {
                let proprietaireClone = {
                  has_contrat: false,
                  ...proprietaire["_doc"],
                };
                if (data.length > 0) {
                  proprietaireClone.has_contrat = true;
                }
                proprietaires.push(proprietaireClone);
                if (requestedProprietaires.length == index + 1) {
                  resolve(proprietaires);
                }
              })
              .catch((error) => {
                reject(error.message);
              });
          });
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        promise
          .then((data) => {
            res.send(data);
          })
          .catch((error) => {
            res.status(200).send({
              message: `Aucun affectation proprietaire trouvé` || error.message,
            });
          });
      })
      .catch((error) => {
        res.status(200).send({ message: `Aucun Propriétaire trouvé` || error });
      });
  },

  getAllProprietairefromFoncier: async (req, res) => {
    // , numero_contrat: "666/dr666"
    await Foncier.find({ deleted: false })
      .populate({
        path: "proprietaire",
        populate: { path: "proprietaire_list", match: { deleted: false } },
        match: { deleted: false },
      })
      .populate({
        path: "lieu",
        populate: {
          path: "lieu",
          select: "_id intitule_lieu",
          match: { deleted: false },
        },
        match: { deleted: false },
        select: "proprietaire lieu",
      })
      .populate({ path: "contrat", select: "numero_contrat etat_contrat" })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },

  getIdFoncierByProprietaire: async (req, res) => {
    await Foncier.find({ deleted: false, proprietaire: req.params.Id }, "_id")
      .then((data) => {
        res.send(data);
      })
      .catch((error) => {
        res.status(200).send({ message: `Aucun Lieu trouvé` || error });
      });
  },

  //Chercher propriétaires par ID
  getProprietairePerID: async (req, res) => {
    await Proprietaire.findById(req.params.Id)
      .then((data) => {
        res.send(data);
      })
      .catch((error) => {
        console.log(error.message);
        res.status(500).send({ message: `Aucun Propriétaire trouvé` || error });
      });
  },

  getUnusedProprietaires: async (req, res) => {
    await Contrat.findById(
      {
        _id: req.params.IdContrat,
      },
      { delted: false }
    )
      .populate({ path: "proprietaires", match: { deleted: false } })
      .then(async (contrat) => {
        const promise = new Promise((resolve, reject) => {
          let contratProprietaires = [];
          if (contrat.proprietaires.length == 0) resolve(contratProprietaires);

          contrat.proprietaires.forEach((affectationProprietaire, index) => {
            contratProprietaires.push(
              affectationProprietaire.proprietaire.toString()
            );
            if (contrat.proprietaires.length == index + 1) {
              resolve(contratProprietaires);
            }
          });
        });

        promise.then((data) => {
          Proprietaire.find({ deleted: false })
            .then((proprietaires) => {
              let proprietairesResult = proprietaires.filter((proprietaire) => {
                return !data.includes(proprietaire._id.toString());
              });
              res.json(proprietairesResult);
            })
            .catch((error) => {
              console.log(error.message);
              res
                .status(500)
                .send({ message: `Aucun Propriétaire trouvé` || error });
            });
        });
      })
      .catch((error) => {
        console.log(error.message);
        res.status(500).send({ message: `Aucun contrat trouvé` });
      });
  },

  getCountProprietaire: async (req, res) => {
    await Proprietaire.countDocuments({ deleted: false })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },
};
