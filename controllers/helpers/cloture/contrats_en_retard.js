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

    let lateContratTreatmentDate = {
      month: new Date(contrat.date_debut_loyer).getMonth() + 1,
      year: new Date(contrat.date_debut_loyer).getFullYear(),
    };
    // Avance
    let dureeAvance = 0;
    let dureeAvanceRappel = 0;

    // Separate avance period from 'Rappel'
    let result = clotureHelper.removeAvanceFromRappel(
      lateContratTreatmentDate,
      { treatmentMonth, treatmentAnnee },
      contrat
    );

    // console.log("Contrat", contrat);
    lateContratTreatmentDate = result.lateContratTreatmentDate;
    dureeAvance = result.dureeAvance;
    dureeAvanceRappel = result.dureeAvanceRappel;

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
          }
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
          false // Calcul caution
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
            calculCaution
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

        lateContratTreatmentDate = await incrementMonth(
          lateContratTreatmentDate.month,
          lateContratTreatmentDate.year
        );

        if (
          lateContratTreatmentDate.month == treatmentMonth &&
          lateContratTreatmentDate.year == treatmentAnnee
        ) {
          calculCaution = true;
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
          lateContratTreatmentDate.month == +treatmentMonth + 1 &&
          lateContratTreatmentDate.year == treatmentAnnee
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
              false
            )
          );
          ordreVirement = [];
          comptabilisationLoyer = [];
        }
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
};

module.exports = lateContratTreatment;
