const Contrat = require("../../../models/contrat/contrat.model");
const proprietaireHelper = require("../proprietaire");
const incrementMonth = require("../shared/increment_month");
const sharedHelper = require("../shared/aggrigationObjects");
const clotureHelper = require("../shared/cloture_helper");
const traitementContratActif = require("./contrats_actif");

const lateContratTreatment = async (
  res,
  contrat,
  dateGenerationDeComptabilisation,
  periodicite,
  ContratSchema,
  Cloture,
  treatmentMonth,
  treatmentAnnee
) => {
  try {
    let isTreatmentEnded = false;
    let aggrigatedComptabilisationLoyer = [],
      aggrigatedOrdreVirement = [],
      comptabilisationLoyerDebiter = [],
      ordreVirement = [],
      comptabilisationLoyer = [];
    let lateContratTreatmentDate;
    // Avance
    let dureeAvance = 0;
    let dureeAvanceRappel = 0;

    if (contrat.is_avenant) {
      console.log("TTeeeeeeeeeeeest");
      lateContratTreatmentDate = {
        month: new Date(contrat.date_comptabilisation).getMonth() + 1,
        year: new Date(contrat.date_comptabilisation).getFullYear(),
      };
    } else {
      lateContratTreatmentDate = {
        month: new Date(contrat.date_debut_loyer).getMonth() + 1,
        year: new Date(contrat.date_debut_loyer).getFullYear(),
      };

      // Separate avance period from 'Rappel'
      let result = clotureHelper.removeAvanceFromRappel(
        lateContratTreatmentDate,
        { treatmentMonth, treatmentAnnee },
        contrat
      );

      lateContratTreatmentDate = result.lateContratTreatmentDate;
      dureeAvance = result.dureeAvance;
      dureeAvanceRappel = result.dureeAvanceRappel;
    }

    // Rappel Avance treatment
    if (dureeAvanceRappel > 0) {
      const treatmentResult =
        await proprietaireHelper.avanceByDurationTreatment(
          contrat,
          dureeAvanceRappel,
          dateGenerationDeComptabilisation,
          {
            treatmentMonth,
            treatmentAnnee,
          },
          false // Calcul caution
        );

      ordreVirement.push(...treatmentResult.ordre_virement);
      comptabilisationLoyer.push(...treatmentResult.cmptLoyerCrdt);
    }

    // Current Avance treatment
    if (dureeAvance > 0) {
      const treatmentResult =
        await proprietaireHelper.avanceByDurationTreatment(
          contrat,
          dureeAvance,
          dateGenerationDeComptabilisation,
          {
            treatmentMonth,
            treatmentAnnee,
          },
          true // Calcul caution
        );

      aggrigatedOrdreVirement.push(...treatmentResult.ordre_virement);
      aggrigatedComptabilisationLoyer.push(...treatmentResult.cmptLoyerCrdt);
      if (ordreVirement.length > 0) {
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
      }
    }

    if (dureeAvance == 0) {
      let calculCaution = false;
      while (!isTreatmentEnded) {
        // if (
        //   lateContratTreatmentDate.month == 10 &&
        //   lateContratTreatmentDate.year == 2022
        // ) {
        //   console.log(typeof treatmentMonth);
        // } else {
        //   console.log(lateContratTreatmentDate);
        //   console.log("Ouuuut");
        // }
        // break;
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

        const treatmentResult =
          await traitementContratActif.clotureContratActif(
            res,
            requestedContrat,
            dateGenerationDeComptabilisation,
            ContratSchema,
            true,
            lateContratTreatmentDate.month,
            lateContratTreatmentDate.year,
            true,
            calculCaution // Calcul caution
          );

        calculCaution = false;

        ordreVirement.push(...treatmentResult.ordre_virement);
        comptabilisationLoyer.push(...treatmentResult.cmptLoyerCrdt);

        if (
          lateContratTreatmentDate.month == 12 &&
          lateContratTreatmentDate.year == +treatmentAnnee - 1
        ) {
          // console.log();
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
              true,
              false
            )
          );
          ordreVirement = [];
          comptabilisationLoyer = [];
        }

        // increment the date by 1 month
        lateContratTreatmentDate = await incrementMonth(
          lateContratTreatmentDate.month,
          lateContratTreatmentDate.year
        );

        if (
          lateContratTreatmentDate.month == treatmentMonth &&
          lateContratTreatmentDate.year == treatmentAnnee
        ) {
          // if (!contrat.is_avenant) {
          calculCaution = !contrat.caution_versee;
          // }
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

        if (
          (lateContratTreatmentDate.month == +treatmentMonth + 1 &&
            lateContratTreatmentDate.year == treatmentAnnee) ||
          (lateContratTreatmentDate.month == 1 &&
            lateContratTreatmentDate.year == +treatmentAnnee + 1)
        ) {
          isTreatmentEnded = true;
          aggrigatedOrdreVirement.push(
            ...sharedHelper.aggrigateOrderVirementObjects(
              ordreVirement,
              false,
              false
            )
          );
          aggrigatedComptabilisationLoyer.push(
            ...sharedHelper.aggrigateLoyerComptObjects(
              comptabilisationLoyer,
              false,
              false,
              !calculCaution
            )
          );
          ordreVirement = [];
          comptabilisationLoyer = [];
        }
        // break;
      }
    }

    if (!Cloture) {
      await ContratSchema.findByIdAndUpdate(
        { _id: contrat._id },
        {
          date_comptabilisation: contrat.date_comptabilisation,
          caution_versee: contrat.caution_versee,
          avance_versee: contrat.avance_versee,
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
};

module.exports = lateContratTreatment;
