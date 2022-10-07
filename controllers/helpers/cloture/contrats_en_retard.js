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
    let calculCaution = false;
    // Avance
    let dureeAvance = 0;
    let dureeAvanceRappel = 0;
    let dureeAvanceRappelAnneeAntr = 0;

    if (contrat.is_avenant) {
      lateContratTreatmentDate = {
        month: new Date(contrat.etat_contrat.etat.date_effet_av).getMonth() + 1,
        year: new Date(contrat.etat_contrat.etat.date_effet_av).getFullYear(),
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
      dureeAvanceRappelAnneeAntr = result.dureeAvanceRappelAnneeAntr;
    }

    // Rappel Avance treatment previous year
    if (dureeAvanceRappelAnneeAntr > 0) {
      const treatmentResult =
        await proprietaireHelper.avanceByDurationTreatment(
          contrat,
          dureeAvanceRappelAnneeAntr,
          dateGenerationDeComptabilisation,
          {
            treatmentMonth,
            treatmentAnnee,
          },
          false // Calcul caution
        );

      aggrigatedOrdreVirement.push(
        ...sharedHelper.aggrigateOrderVirementObjects(
          treatmentResult.ordre_virement,
          true,
          true
        )
      );
      aggrigatedComptabilisationLoyer.push(
        ...sharedHelper.aggrigateLoyerComptObjects(
          treatmentResult.cmptLoyerCrdt,
          true,
          true,
          true
        )
      );
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

      if (
        (lateContratTreatmentDate.month >= treatmentMonth &&
          lateContratTreatmentDate.year == treatmentAnnee) ||
        lateContratTreatmentDate.year > treatmentAnnee
      ) {
        if (!contrat.is_avenant) {
          calculCaution = true;
        }
        if (
          (lateContratTreatmentDate.month > treatmentMonth &&
            lateContratTreatmentDate.year == treatmentAnnee) ||
          lateContratTreatmentDate.year > treatmentAnnee
        ) {
          isTreatmentEnded = true;
        }
        aggrigatedOrdreVirement.push(
          ...sharedHelper.aggrigateOrderVirementObjects(
            treatmentResult.ordre_virement,
            true,
            false
          )
        );
        aggrigatedComptabilisationLoyer.push(
          ...sharedHelper.aggrigateLoyerComptObjects(
            treatmentResult.cmptLoyerCrdt,
            true,
            false
          )
        );
        ordreVirement = [];
        comptabilisationLoyer = [];
      } else {
        ordreVirement.push(...treatmentResult.ordre_virement);
        comptabilisationLoyer.push(...treatmentResult.cmptLoyerCrdt);
      }
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
          true, // Calcul caution
          false
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
      isTreatmentEnded = true;
    }

    if (
      (lateContratTreatmentDate.month > treatmentMonth &&
        lateContratTreatmentDate.year == treatmentAnnee) ||
      lateContratTreatmentDate.year > treatmentAnnee
    ) {
      isTreatmentEnded = true;
    }

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

      const treatmentResult = await traitementContratActif.clotureContratActif(
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
            true
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
        if (!contrat.is_avenant) {
          calculCaution = true;
        } 

        //   isTreatmentEnded = true;
        //   break;
        
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
            //!calculCaution
            contrat.is_avenant ? true : false
          )
        );
        ordreVirement = [];
        comptabilisationLoyer = [];
      }
      // break;
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
