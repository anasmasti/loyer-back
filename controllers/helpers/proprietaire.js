const Contrat = require("../../models/contrat/contrat.model");
const User = require("../../models/roles/roles.model");
const AffectationProprietaire = require("../../models/affectation_proprietaire/affectation_proprietaire.schema");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const mail = require("../../helpers/mail.send");
const Calcule = require("./calculProprietaire");

module.exports = {
  proprietaireASupprimer: async (contrat) => {
    contrat.etat_contrat.etat.deleted_proprietaires.forEach(
      async (affectationProprietaire) => {
        await AffectationProprietaire.findByIdAndUpdate(
          { _id: affectationProprietaire },
          { statut: "À supprimer" }
        );
      }
    );
  },

  deleteProprietaire: async (req, res, proprietareId) => {
    await Proprietaire.findByIdAndUpdate(proprietareId, {
      deleted: true,
    }).catch((error) => {
      res.status(400).send({ message: error.message });
    });
  },

  duplicateProprietaire: async (
    req,
    res,
    proprietaire,
    newContrat,
    deletedProprietaires
  ) => {
    proprietaireList = [];
    if (proprietaire.is_mandataire) {
      for (let j = 0; j < proprietaire.proprietaire_list.length; j++) {
        const _proprietaire = proprietaire.proprietaire_list[j];
        let isProprietaireDeleted = false;

        for (let i = 0; i < deletedProprietaires.length; i++) {
          const deletedProprietaire = deletedProprietaires[i];
          if (_proprietaire._id == deletedProprietaire) {
            isProprietaireDeleted = true;
          }
        }

        if (!isProprietaireDeleted) {
          proprietaireList.push(_proprietaire);
        }
      }
    }
    const calculeProprietaire = await Calcule(
      newContrat,
      proprietaire.part_proprietaire,
      proprietaire._id,
      proprietaire.declaration_option
    );

    const affectationProprietaire = new AffectationProprietaire({
      deleted: false,
      proprietaire: proprietaire.proprietaire,
      contrat: newContrat._id,
      is_mandataire: proprietaire.is_mandataire,
      has_mandataire: proprietaire.has_mandataire,
      taux_impot: calculeProprietaire.taux_impot,
      retenue_source: calculeProprietaire.retenue_source,
      montant_apres_impot: calculeProprietaire.montant_apres_impot,
      montant_loyer: calculeProprietaire.montant_loyer,
      montant_avance_proprietaire:
        calculeProprietaire.montant_avance_proprietaire,
      tax_avance_proprietaire: calculeProprietaire.tax_avance_proprietaire,
      tax_par_periodicite: calculeProprietaire.tax_par_periodicite,
      part_proprietaire: proprietaire.part_proprietaire,
      caution_par_proprietaire: calculeProprietaire.caution_par_proprietaire,
      proprietaire_list: proprietaire.is_mandataire
        ? proprietaireList
        : proprietaire.proprietaire_list,
      // proprietaire_list: proprietaire.proprietaire_list,
      declaration_option: proprietaire.declaration_option,
      statut: proprietaire.statut,
    });

    await affectationProprietaire
      .save()
      .then(async (data) => {
        await Contrat.findByIdAndUpdate(
          { _id: newContrat._id },
          { $push: { proprietaires: data._id } }
        ).catch((error) => {
          res.status(422).send({
            message: error.message,
          });
        });
      })
      .catch((error) => {
        res.status(422).send({
          message: error.message,
        });
      });
  },
};
