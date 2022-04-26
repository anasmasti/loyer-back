const AffectationProprietaire = require("../../models/proprietaire/proprietaire.model");

module.exports = {
  deleteAffectationProprietaire: async (req, res) => {
    await AffectationProprietaire.findByIdAndUpdate(req.params.Id, {
      deleted: req.body.deleted,
    })
      .then(() => {
        res.send({ message: "Affectation proprietaire supprimé avec succés" });
      })
      .catch((error) => {
        res
          .status(400)
          .send({
            message: `Erreur de suppression du propriétaire` || error.message,
          });
      });
  },
};
