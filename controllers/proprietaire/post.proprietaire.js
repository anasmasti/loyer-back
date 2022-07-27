const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const ProprietaireValidation = require("../../validation/proprietaire.validation");
const Foncier = require("../../models/foncier/foncier.model");
const mongoose = require("mongoose");

module.exports = {
  // Ajouter un propriétaire
  postProprietaire: async (req, res) => {
    try {
      // ::::::::::::::::::::::::::::::::::::::::::::::::::::: Proprietaire validation ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
      // L'obligation d'au moin un cin ou passport ou carte sejour
      if (
        req.body.cin == "" &&
        req.body.passport == "" &&
        req.body.carte_sejour == "" &&
        req.body.type_proprietaire == "Personne physique"
      ) {
        return res.status(422).send({
          message: `Propriétaire doit contenir au moin Cin , Passport ou Carte séjour`,
        });
      }

      // La validation d'unicité du Proprietaire
      const ValidateCinProprietaire = await Proprietaire.findOne({
        cin: req.body.cin,
      });
      const ValidatePassportProprietaire = await Proprietaire.findOne({
        passport: req.body.passport,
      });
      const ValidateCarteSejourProprietaire = await Proprietaire.findOne({
        carte_sejour: req.body.carte_sejour,
      });

      if (ValidateCinProprietaire) {
        if (ValidateCinProprietaire.cin != "")
          return res.status(422).send({ message: `Cin est déja pris` });
      }
      if (ValidatePassportProprietaire) {
        if (ValidatePassportProprietaire.passport != "")
          return res.status(422).send({ message: `Passport est déja pris` });
      }
      if (ValidateCarteSejourProprietaire) {
        if (ValidateCarteSejourProprietaire.carte_sejour != "")
          return res
            .status(422)
            .send({ message: `Carte séjour est déja pris` });
      }

      const proprietaire = new Proprietaire({
        _id: req.body._id,
        deleted: false,
        cin: req.body.cin.toUpperCase(),
        passport: req.body.passport.toUpperCase(),
        carte_sejour: req.body.carte_sejour.toUpperCase(),
        nom_prenom: req.body.nom_prenom.toUpperCase(),
        raison_social: req.body.raison_social.toUpperCase(),
        n_registre_commerce: req.body.n_registre_commerce,
        telephone: req.body.telephone,
        fax: req.body.fax,
        adresse: req.body.adresse.toUpperCase(),
        n_compte_bancaire: req.body.n_compte_bancaire,
        banque: req.body.banque.toUpperCase(),
        type_proprietaire: req.body.type_proprietaire,
        nom_agence_bancaire: req.body.nom_agence_bancaire.toUpperCase(),
      });

      await proprietaire
        .save()
        .then(async (data) => {
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
