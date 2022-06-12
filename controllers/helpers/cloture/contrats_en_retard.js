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
      comptabilisationLoyer = [],
      ordreVirement = [];

    let lateContratTreatmentDate = {
      month: new Date(contrat.date_debut_loyer).getMonth() + 1,
      year: new Date(contrat.date_debut_loyer).getFullYear(),
    };
    let dureeAvanceToPay = 0;

    // Remove avance period from 'Rappel'
    let result = clotureHelper.removeAvanceFromRappel(
      lateContratTreatmentDate,
      { treatmentMonth, treatmentAnnee },
      contrat
    );

    // console.log("Contrat", contrat);
    lateContratTreatmentDate = result.lateContratTreatmentDate;
    dureeAvanceToPay = result.dureeAvanceToPay;

    if (dureeAvanceToPay > 0) {
      const treatmentResult =
        await proprietaireHelper.avanceByDurationTreatment(
          contrat,
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
            lateContratTreatmentDate.year,
            true
          );

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
          // isTreatmentEnded = true;
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
