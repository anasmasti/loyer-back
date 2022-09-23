const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const ProprietaireValidation = require("../../validation/proprietaire.validation");

module.exports = {
  // Modifier un propriétaire
  putProprietaire: async (req, res, next) => {
    try {
      if (Object.keys(req.body).length === 0)
        return res.status(500).send({ message: `Contenu doit pas être vide` });

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
        if (
          ValidateCinProprietaire.cin == req.body.cin &&
          ValidateCinProprietaire.cin != "" &&
          ValidateCinProprietaire._id != req.params.Id
        ) {
          return res.status(422).send({ message: "CIN est déja pris" });
        }
      }

      if (ValidatePassportProprietaire) {
        if (
          ValidatePassportProprietaire.passport == req.body.passport &&
          ValidatePassportProprietaire.passport != "" &&
          ValidatePassportProprietaire._id != req.params.Id
        ) {
          return res.status(422).send({ message: "Passport est déja pris" });
        }
      }

      if (ValidateCarteSejourProprietaire) {
        if (
          ValidateCarteSejourProprietaire.carte_sejour ==
            req.body.carte_sejour &&
          ValidateCarteSejourProprietaire.carte_sejour != "" &&
          ValidateCarteSejourProprietaire._id != req.params.Id
        ) {
          return res
            .status(422)
            .send({ message: "Carte séjour est déja pris" });
        }
      }

      await Proprietaire.findByIdAndUpdate(req.params.Id, {
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
      })
        .then(async (data) => {
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
