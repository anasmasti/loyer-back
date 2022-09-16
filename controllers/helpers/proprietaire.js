const Contrat = require("../../models/contrat/contrat.model");
const User = require("../../models/roles/roles.model");
const AffectationProprietaire = require("../../models/affectation_proprietaire/affectation_proprietaire.schema");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const mail = require("../../helpers/mail.send");
const Calcule = require("./calculProprietaire");
const createObjectHelper = require("./shared/create_objects");

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

  avanceByDurationTreatment: async (
    contrat,
    dureeAvance,
    dateGenerationDeComptabilisation,
    treatmentDate,
    calculCaution,
    isOverduedAvance = true
  ) => {
    let comptabilisationLoyerCrediter = [];
    let ordreVirement = [];
    let montant_net_global_mandataire = 0;
    let montant_brut_global_mandataire = 0;
    let montant_loyer_brut_mandataire = 0;
    let montant_tax_mandataire = 0;
    let montant_brut_global = 0;
    let montant_loyer_brut = 0;
    let montant_tax = 0;
    let montant_net_global = 0;

    try {
      for (let g = 0; g < contrat.foncier.lieu.length; g++) {
        if (contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < contrat.proprietaires.length; j++) {
            if (contrat.proprietaires[j].is_mandataire == true) {
              // Calcul 'Montants d'avance' by duration
              let montantAvance = 0;
              let taxAvance = 0;

              montantAvance =
                +contrat.proprietaires[j].montant_loyer.toFixed(2) *
                dureeAvance;
              taxAvance =
                +contrat.proprietaires[j].retenue_source.toFixed(2) *
                dureeAvance;
              // Fin ( Calcul 'Montants d'avance' by duration )

              if (calculCaution) {
                montant_brut_global_mandataire =
                  +montantAvance.toFixed(2) +
                  +contrat.proprietaires[j].caution_par_proprietaire.toFixed(2);
              } else {
                montant_brut_global_mandataire = +montantAvance.toFixed(2);
              }

              montant_tax_mandataire = +taxAvance.toFixed(2);

              montant_net_global_mandataire =
                montant_brut_global_mandataire - montant_tax_mandataire;

              // 'Montant net' global excluding 'caution'
              montant_net_without_caution =
                +montantAvance.toFixed(2) - +taxAvance.toFixed(2);

              comptabilisationLoyerCrediter.push(
                createObjectHelper.createComptLoyerCredObject(
                  contrat,
                  contrat.proprietaires[j],
                  contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_net_global_mandataire,
                  montant_tax_mandataire,
                  montant_brut_global_mandataire, // 'Montant brut' including 'avance' and 'caution' if they exist
                  0, // Montant brut de loyer
                  null,
                  calculCaution
                    ? +contrat.proprietaires[
                        j
                      ].caution_par_proprietaire.toFixed(2)
                    : 0,
                  montant_net_without_caution,
                  treatmentDate.treatmentMonth,
                  treatmentDate.treatmentAnnee,
                  isOverduedAvance
                )
              );
              if (contrat.proprietaires[j].proprietaire_list.length != 0) {
                for (
                  let k = 0;
                  k < contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  // Calcul 'Montants d'avance' by duration
                  montantAvance =
                    +contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_loyer.toFixed(2) * dureeAvance;
                  taxAvance =
                    +contrat.proprietaires[j].proprietaire_list[
                      k
                    ].retenue_source.toFixed(2) * dureeAvance;
                  // Fin ( Calcul 'Montants d'avance' by duration )

                  if (calculCaution) {
                    montant_brut_global =
                      +montantAvance.toFixed(2) +
                      +contrat.proprietaires[j].proprietaire_list[
                        k
                      ].caution_par_proprietaire.toFixed(2);
                  } else {
                    montant_brut_global = +montantAvance.toFixed(2);
                  }

                  montant_tax = +taxAvance.toFixed(2);

                  montant_net_global =
                    +montant_brut_global.toFixed(2) - +montant_tax.toFixed(2);

                  montant_tax_mandataire += +montant_tax.toFixed(2);

                  montant_brut_global_mandataire +=
                    +montant_brut_global.toFixed(2);

                  montant_net_global_mandataire += montant_net_global;

                  montant_net_without_caution =
                    +montantAvance.toFixed(2) - +taxAvance.toFixed(2);

                  comptabilisationLoyerCrediter.push(
                    createObjectHelper.createComptLoyerCredObject(
                      contrat,
                      contrat.proprietaires[j].proprietaire_list[k],
                      contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_net_global,
                      montant_tax,
                      montant_brut_global, // 'Montant brut' including 'avance' and 'caution' if they exist
                      0, // Montant brut de loyer
                      contrat.date_debut_loyer,
                      calculCaution
                        ? +contrat.proprietaires[j].proprietaire_list[
                            k
                          ].caution_par_proprietaire.toFixed(2)
                        : 0,
                      montant_net_without_caution,
                      treatmentDate.treatmentMonth,
                      treatmentDate.treatmentAnnee,
                      isOverduedAvance
                    )
                  );
                  montant_net_global = 0;
                  montant_brut_global = 0;
                  montant_tax = 0;
                }
              }

              ordreVirement.push(
                createObjectHelper.createOrderVirementObject(
                  contrat.foncier.lieu[g],
                  contrat.proprietaires[j],
                  contrat.numero_contrat,
                  contrat.periodicite_paiement,
                  treatmentDate.treatmentMonth,
                  treatmentDate.treatmentAnnee,
                  montant_net_global_mandataire,
                  montant_brut_global_mandataire,
                  montant_tax_mandataire,
                  contrat.updatedAt
                )
              );
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    // res.json({
    //   ordre_virement: ordreVirement,
    //   cmptLoyerCrdt: comptabilisationLoyerCrediter,
    // });

    return {
      ordre_virement: ordreVirement,
      cmptLoyerCrdt: comptabilisationLoyerCrediter,
    };
  },
};
