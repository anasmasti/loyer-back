const etatPaths = require("../../models/situation_cloture/etatPaths.schema");

module.exports = {
  allEtats: async (req, res) => {
    await etatPaths
      .find({
        mois: req.params.mois,
        annee: req.params.annee
      })
      .then((data) => {
        let mois, annee;
        try {
          let requestedEtatsPaths = [],
            responsedData = [];
          for (j in data) {
            requestedEtatsPaths = [];
            for (k in req.body) {
              for (let i = 0; i < data[j].etat_paths.length; i++) {
                let name = Object.keys(data[j].etat_paths[i])[0];
                let path = data[j].etat_paths[i][name];
                if (Object.keys(data[j].etat_paths[i])[0] == req.body[k]) {
                  requestedEtatsPaths.push(data[j].etat_paths[i]);
                  mois = data[j].mois;
                  annee = data[j].annee;
                }
              }
            }
            responsedData.push({
              etatPaths: requestedEtatsPaths,
              mois: mois,
              annee: annee,
            });
          }
          res.json({responsedData});
        } catch (error) {
          throw error;
        }
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },
};
