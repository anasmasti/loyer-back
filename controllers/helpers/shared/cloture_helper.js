const Contrat = require("../../../models/contrat/contrat.model");
const proprietaireHelper = require("../proprietaire");
const incrementMonth = require("./increment_month");
const sharedHelper = require("./aggrigationObjects");
const moment = require("moment");
const traitementContratActif = require("../cloture/contrats_actif");

module.exports = {
  removeAvanceFromRappel: (
    lateContratTreatmentDate,
    treatmentDate,
    contrat
  ) => {
    let periodicite = 0;
    let dureeAvance = 0;
    let dureeAvanceRappel = 0;
    let dureeAvanceRappelAnneeAntr = 0;

    // Convert duree avance to months
    switch (contrat.periodicite_paiement) {
      case "mensuelle":
        periodicite = 1;
        break;
      case "trimestrielle":
        periodicite = 3;
        break;
      case "annuelle":
        periodicite = 12;
        break;
    }

    // Remove avance months from overdued months
    if (contrat.periodicite_paiement == "annuelle") {
      for (let index = 0; index < contrat.duree_avance; index++) {
        // Get overdued avance months
        if (
          (lateContratTreatmentDate.month < treatmentDate.treatmentMonth &&
            lateContratTreatmentDate.year == treatmentDate.treatmentAnnee) ||
          lateContratTreatmentDate.year < treatmentDate.treatmentAnnee
        ) {
          dureeAvanceRappel += 1;
        }
        // Get avance months if it's not overdued
        if (
          (lateContratTreatmentDate.month >= treatmentDate.treatmentMonth &&
            lateContratTreatmentDate.year >= treatmentDate.treatmentAnnee) ||
          lateContratTreatmentDate.year > treatmentDate.treatmentAnnee
        ) {
          dureeAvance += 1;
        }

        if (
          // lateContratTreatmentDate.month == 12 &&
          lateContratTreatmentDate.year <= treatmentDate.treatmentAnnee
        ) {
          dureeAvanceRappelAnneeAntr = dureeAvanceRappelAnneeAntr + 1;
          dureeAvanceRappel = 0;
        }

        lateContratTreatmentDate = incrementMonth(
          lateContratTreatmentDate.month,
          lateContratTreatmentDate.year,
          periodicite
        );
      }
    } else {
      for (let index = 0; index < contrat.duree_avance; index++) {
        // Get overdued avance months
        if (
          (lateContratTreatmentDate.month < treatmentDate.treatmentMonth &&
            lateContratTreatmentDate.year == treatmentDate.treatmentAnnee) ||
          lateContratTreatmentDate.year < treatmentDate.treatmentAnnee
        ) {
          dureeAvanceRappel += 1;
        }
        // Get avance months if it's not overdued
        if (
          (lateContratTreatmentDate.month >= treatmentDate.treatmentMonth &&
            lateContratTreatmentDate.year >= treatmentDate.treatmentAnnee) ||
          lateContratTreatmentDate.year > treatmentDate.treatmentAnnee
        ) {
          if (dureeAvanceRappel > 0) {
            dureeAvance = dureeAvanceRappel + 1;
            dureeAvanceRappel = 0;
          } else {
            dureeAvance += 1;
          }
        }

        if (
          lateContratTreatmentDate.month == 12 &&
          lateContratTreatmentDate.year == +treatmentDate.treatmentAnnee - 1
        ) {
          dureeAvanceRappelAnneeAntr = dureeAvanceRappel;
          dureeAvanceRappel = 0;
        }

        lateContratTreatmentDate = incrementMonth(
          lateContratTreatmentDate.month,
          lateContratTreatmentDate.year,
          periodicite
        );
      }
    }

    console.log({
      numero: contrat.numero_contrat,
      lateContratTreatmentDate,
      dureeAvance,
      dureeAvanceRappel,
      dureeAvanceRappelAnneeAntr,
    });

    return {
      lateContratTreatmentDate,
      dureeAvance,
      dureeAvanceRappel,
      dureeAvanceRappelAnneeAntr,
    };
  },

  lateContratTreatment: async (
    res,
    contrat,
    dateGenerationDeComptabilisation,
    periodicite,
    ContratSchema,
    Cloture,
    treatmentMonth,
    treatmentAnnee,
    lateContratTreatmentDate,
    dureeAvanceToPay
  ) => {
    try {
      let isTreatmentEnded = false;
      let aggrigatedComptabilisationLoyer = [],
        aggrigatedOrdreVirement = [],
        comptabilisationLoyerDebiter = [],
        comptabilisationLoyer = [],
        ordreVirement = [];

      if (dureeAvanceToPay > 0) {
        const treatmentResult =
          await proprietaireHelper.avanceByDurationTreatment(
            Contrat,
            dureeAvanceToPay,
            dateGenerationDeComptabilisation,
            {
              treatmentMonth,
              treatmentAnnee,
            }
          );

        aggrigatedOrdreVirement.push(...treatmentResult.ordre_virement);
        aggrigatedComptabilisationLoyer.push(...treatmentResult.cmptLoyerCrdt);
      } else {
        while (!isTreatmentEnded) {
          // Request updated contrat
          const requestedContrat = await Contrat.findById({
            _id: contrat._id,
          })
            .populate({
              path: "foncier",
              populate: {
                path: "lieu.lieu",
                populate: {
                  path: "attached_DR",
                },
              },
            })
            .populate({
              path: "proprietaires",
              populate: [
                {
                  path: "proprietaire_list",
                  populate: { path: "proprietaire" },
                },
                {
                  path: "proprietaire",
                },
              ],
              match: { is_mandataire: true, deleted: false },
            });

          //   console.log("requestedContrat", requestedContrat);
          const treatmentResult =
            await traitementContratActif.clotureContratActif(
              res,
              requestedContrat,
              dateGenerationDeComptabilisation,
              ContratSchema,
              true,
              lateContratTreatmentDate.month,
              lateContratTreatmentDate.year
            );

          ordreVirement.push(...treatmentResult.ordre_virement);
          comptabilisationLoyer.push(...treatmentResult.cmptLoyerCrdt);

          if (
            lateContratTreatmentDate.month == 12 &&
            lateContratTreatmentDate.year == +lateContratTreatmentDate.year - 1
          ) {
            aggrigatedOrdreVirement.push(
              ...sharedHelper.aggrigateOrderVirementObjects(
                ordreVirement,
                true,
                true
              )
            );
            aggrigatedComptabilisationLoyer.push(
              ...sharedHelper.aggrigateLoyerComptObjects(
                comptabilisationLoyer,
                true,
                true
              )
            );
            ordreVirement = [];
            comptabilisationLoyer = [];
          }

          //   console.log(lateContratTreatmentDate);

          lateContratTreatmentDate = await incrementMonth(
            lateContratTreatmentDate.month,
            lateContratTreatmentDate.year
          );

          if (
            lateContratTreatmentDate.month == treatmentMonth &&
            lateContratTreatmentDate.year == treatmentAnnee
          ) {
            isTreatmentEnded = true;
            aggrigatedOrdreVirement.push(
              ...sharedHelper.aggrigateOrderVirementObjects(
                ordreVirement,
                true,
                false
              )
            );
            aggrigatedComptabilisationLoyer.push(
              ...sharedHelper.aggrigateLoyerComptObjects(
                comptabilisationLoyer,
                true,
                false
              )
            );
            ordreVirement = [];
            comptabilisationLoyer = [];
          }

          //   if (
          //     lateContratTreatmentDate.month == +treatmentMonth + 1 &&
          //     lateContratTreatmentDate.year == treatmentAnnee
          //   ) {
          //     isTreatmentEnded = true;
          //     aggrigatedOrdreVirement.push(
          //       ...sharedHelper.aggrigateOrderVirementObjects(
          //         ordreVirement,
          //         false,
          //         false
          //       )
          //     );
          //     aggrigatedComptabilisationLoyer.push(
          //       ...sharedHelper.aggrigateLoyerComptObjects(
          //         comptabilisationLoyer,
          //         false,
          //         false
          //       )
          //     );
          //     ordreVirement = [];
          //     comptabilisationLoyer = [];
          //   }
        }
      }

      if (!Cloture) {
        await ContratSchema.findByIdAndUpdate(
          { _id: contrat._id },
          {
            date_comptabilisation: null,
            caution_versee: false,
            avance_versee: false,
          }
        );
      } else {
        await ContratSchema.findByIdAndUpdate(
          { _id: contrat._id },
          {
            caution_versee: true,
            avance_versee: true,
            is_overdued: false,
          }
        );
      }

      return {
        ordre_virement: aggrigatedOrdreVirement,
        cmptLoyerCrdt: aggrigatedComptabilisationLoyer,
        cmptLoyerDebt: comptabilisationLoyerDebiter,
      };
    } catch (error) {
      console.log(error);
    }
  },

  generateNextDateComptabilisation: (dateDeComptabilisation, periodicite) => {
    let nextDateComptabilisation = dateDeComptabilisation;
    nextDateComptabilisation.setDate(15);

    if (periodicite == 12) {
      nextDateComptabilisation.setFullYear(
        nextDateComptabilisation.getFullYear() + 1
      );
    } else {
      nextDateComptabilisation.setMonth(
        nextDateComptabilisation.getMonth() + periodicite
      );
    }

    return nextDateComptabilisation;
  },
};
