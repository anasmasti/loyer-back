const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const Foncier = require("../../models/foncier/foncier.model");
const Contrat = require("../../models/contrat/contrat.model");
const AffectationProprietaire = require("../../models/affectation_proprietaire/affectation_proprietaire.schema");
const mongoose = require("mongoose");

module.exports = {
  // Ajouter un propriétaire
  postAffectationProprietaire: async (req, res) => {
    try {
      const affectationProprietaire = new AffectationProprietaire({
        deleted: false,
        proprietaire: req.body.proprietaire,
        contrat: req.params.IdContrat,
        is_mandataire: req.body.is_mandataire,
        has_mandataire: null,
        taux_impot: req.body.taux_impot,
        retenue_source: req.body.retenue_source,
        montant_apres_impot: req.body.montant_apres_impot,
        montant_loyer: req.body.montant_loyer,
        montant_avance_proprietaire: req.body.montant_avance_proprietaire,
        tax_avance_proprietaire: req.body.tax_avance_proprietaire,
        tax_par_periodicite: req.body.tax_par_periodicite,
        part_proprietaire: req.body.part_proprietaire,
        caution_par_proprietaire: req.body.caution_par_proprietaire,
        proprietaire_list: req.body.proprietaire_list,
        declaration_option: req.body.declaration_option,
        statut: req.body.statut,
      });

      await affectationProprietaire
        .save()
        .then(async (data) => {
          await Contrat.findByIdAndUpdate(
            { _id: req.params.IdContrat },
            { $push: { proprietaires: data._id } }
          ).catch((error) => {
            res.status(422).send({
              message: error.message,
            });
          });

          // Fill the has_mandataire with the proprietaire id if the inserted proprietaire is a mandataire
          if (req.body.is_mandataire && req.body.proprietaire_list.length > 0) {
            for (let i = 0; i < req.body.proprietaire_list.length; i++) {
              await AffectationProprietaire.findByIdAndUpdate(
                req.body.proprietaire_list[i],
                {
                  has_mandataire: data._id,
                }
              ).catch((error) => {
                res.status(422).send({
                  message: error.message,
                });
              });
            } //end For
          } //end If
          res.json(data);
        })
        .catch((error) => {
          res.status(422).send({
            message: error.message,
          });
        });
    } catch (error) {
      res.status(422).send({
        message: error.message || `Validation error: ${error}`,
      });
    }
  },
};
