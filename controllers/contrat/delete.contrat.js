const Contrat = require("../../models/contrat/contrat.model");
const Foncier = require("../../models/foncier/foncier.model");

module.exports = {
  supprimerContrat: async (req, res) => {
    // remplissage et enregistrement de contrat
    try {
      //find requested contrat
      let findContrat = await Contrat.findById({
        _id: req.params.Id,
        deleted: false,
      });

      //
      await Foncier.findByIdAndUpdate(
        { _id: findContrat.foncier },
        { contrat: null }
      );

      //remplissage
      const updatedContrat = await Contrat.findByIdAndUpdate(
        { _id: req.params.Id },
        { deleted: true },
        { new: true }
      );

      //enregistrement
      res.json(updatedContrat);
    } catch (error) {
      res.status(401).send({ message: error.message });
    }
  },
};
