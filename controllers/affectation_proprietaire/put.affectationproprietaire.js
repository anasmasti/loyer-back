const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const ProprietaireValidation = require("../../validation/proprietaire.validation");
const Contrat = require("../../models/contrat/contrat.model");
const AffectationProprietaire = require("../../models/affectation_proprietaire/affectation_proprietaire.schema");

module.exports = {
  // Modifier un propriétaire
  putAffectationProprietaire: async (req, res, next) => {
    try {
      if (Object.keys(req.body).length === 0)
        return res.status(500).send({ message: `Contenu doit pas être vide` });

      await AffectationProprietaire.findByIdAndUpdate(req.params.Id, {
        is_mandataire: req.body.is_mandataire,
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
      })
        .then(async (data) => {
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

          // Set has mandataire to null to all the unchecked proprietaire
          if (req.body.old_proprietaires_list.length > 0) {
            for (let i = 0; i < req.body.old_proprietaires_list.length; i++) {
              await AffectationProprietaire.findByIdAndUpdate(
                req.body.old_proprietaires_list[i],
                {
                  has_mandataire: null,
                }
              ).catch((error) => {
                res.status(422).send({
                  message: error.message,
                });
              });
            } //end For
          } //end If

          res.send(data);
        })
        .catch((error) => {
          res.status(422).send({
            message: error.message,
          });
        });
    } catch (error) {
      res.status(422).send({
        message: error.message || `Validation erreur: ${error}`,
      });
    }
  },
};
