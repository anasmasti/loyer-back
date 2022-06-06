const Contrat = require("../../../models/contrat/contrat.model");
const ContratHelper = require("../contrat");
const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");
const proprietaireHelper = require("../proprietaire");
const archiveVirement = require("../../../models/archive/archiveVirement.schema");
const incrementMonth = require("./increment_month");
const sharedHelper = require("./aggrigationObjects");
const traitementCloture = require("../cloture/traitement_cloture");

module.exports = {
  checkContratsAv: async (req, res) => {
    await Contrat.findOne({
      "etat_contrat.libelle": "Planifié",
      deleted: false,
    })
      .populate({ path: "old_contrat.contrat" })
      .populate({ path: "foncier", match: { deleted: false } })
      .populate({ path: "proprietaire", match: { deleted: false } })
      .then(async (data) => {
        if (data) {
          let contratAV = data;
          let oldContrats = contratAV.old_contrat;
          let oldContrat;
          let dateFinOldContrat;
          let etatOldContrat;
          let etatNewContrat;

          let nextCloture;
          await archiveComptabilisation
            .find()
            .sort({ date_generation_de_comptabilisation: "desc" })
            .select({ date_generation_de_comptabilisation: 1 })
            .then(async (Comptabilisationdata) => {
              // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
              nextCloture = new Date(
                Comptabilisationdata[0].date_generation_de_comptabilisation
              );

              let currentMonth = nextCloture.getMonth() + 1;
              let currentYear = nextCloture.getFullYear();
              let dateDeffetAV = new Date(
                contratAV.etat_contrat.etat.date_effet_av
              );
              let dateDeffetAVMonth = dateDeffetAV.getMonth() + 1;
              let dateDeffetAVYear = dateDeffetAV.getFullYear();
              if (
                (dateDeffetAVMonth == currentMonth &&
                  dateDeffetAVYear == currentYear) ||
                (dateDeffetAVMonth > currentMonth &&
                  dateDeffetAVYear < currentYear) ||
                (dateDeffetAVMonth < currentMonth &&
                  !(dateDeffetAVYear > currentYear))
              ) {
                if (oldContrats.length > 0) {
                  // Get the old contrat
                  try {
                    oldContrat = oldContrats.find((contrat) => {
                      return contrat.contrat.etat_contrat.libelle == "Actif";
                    }).contrat;
                  } catch (error) {
                    res
                      .status(412)
                      .send({ message: "Aucun contrat actif trouvé" });
                  }

                  // Customise the old contrat etat
                  etatOldContrat = {
                    libelle: "Modifié",
                    etat: oldContrat.etat_contrat.etat,
                  };

                  // Customise the new contrat etat
                  etatNewContrat = {
                    libelle: "Actif",
                    etat: contratAV.etat_contrat.etat,
                  };

                  for (
                    let index = 0;
                    index < contratAV.etat_contrat.etat.motif.length;
                    index++
                  ) {
                    const motif = contratAV.etat_contrat.etat.motif[index];
                    // Delete proprietaires
                    if (motif.type_motif == "Deces") {
                      if (
                        contratAV.etat_contrat.etat.deleted_proprietaires
                          .length > 0
                      ) {
                        for (
                          let index = 0;
                          index <
                          contratAV.etat_contrat.etat.deleted_proprietaires
                            .length;
                          index++
                        ) {
                          const proprietaire =
                            contratAV.etat_contrat.etat.deleted_proprietaires[
                              index
                            ];

                          ContratHelper.proprietaireDeces(
                            req,
                            res,
                            proprietaire
                          );
                        }
                      }
                    }
                  }

                  // Change is_avenant to false

                  // Update the old contrat
                  await Contrat.findByIdAndUpdate(oldContrat._id, {
                    // date_fin_contrat: dateFinOldContrat,
                    etat_contrat: etatOldContrat,
                  });

                  // Update the AV contrat
                  await Contrat.findByIdAndUpdate(contratAV._id, {
                    date_comptabilisation: oldContrat.date_comptabilisation,
                    etat_contrat: etatNewContrat,
                  })
                    .then(async () => {
                      // Sending mail to DAJC, CDGSP and CSLA
                      // ContratHelper.sendMailToAll(req.params.Id);
                    })
                    .catch((error) => {
                      console.error(error.message);
                    });
                }
              }
              // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            })
            .catch((error) => {
              res.status(402).send({ message: error.message });
            });
        }
      });
  },

  checkContratsSus: async (req, res) => {
    await Contrat.find({ deleted: false, "etat_contrat.libelle": "Suspendu" })
      .then(async (contrats) => {
        await archiveComptabilisation
          .find()
          .sort({ date_generation_de_comptabilisation: "desc" })
          .select({ date_generation_de_comptabilisation: 1 })
          .then(async (Comptabilisationdata) => {
            for (let index = 0; index < contrats.length; index++) {
              const contrat = contrats[index];
              let susDate = new Date(
                contrat.etat_contrat.etat.date_fin_suspension
              );
              let susMonth = susDate.getMonth() + 1;
              let susYear = susDate.getFullYear();
              let nextDateComptabilisation = null;
              let nextCloture;
              nextCloture = new Date(
                Comptabilisationdata[0].date_generation_de_comptabilisation
              );
              let currentMonth = nextCloture.getMonth() + 1;
              let currentYear = nextCloture.getFullYear();
              if (
                (susMonth == currentMonth && susYear == currentYear) ||
                (susMonth > currentMonth && susYear < currentYear) ||
                (susMonth < currentMonth && !(susYear > currentYear))
              ) {
                if (
                  contrat.etat_contrat.etat.duree_suspension != null &&
                  contrat.etat_contrat.etat.duree_suspension > 0
                ) {
                  if (contrat.date_comptabilisation != null) {
                    const isLessThan = ContratHelper.chackContratDate(
                      contrat.date_comptabilisation,
                      contrat.etat_contrat.etat.date_fin_suspension
                    );
                    if (isLessThan) {
                      nextDateComptabilisation = new Date(
                        contrat.etat_contrat.etat.date_fin_suspension
                      );
                    } else {
                      nextDateComptabilisation = new Date(
                        contrat.date_comptabilisation
                      );
                    }
                  } else {
                    if (
                      ContratHelper.chackContratDate(
                        contrat.date_premier_paiement,
                        contrat.etat_contrat.etat.date_fin_suspension
                      )
                    ) {
                      nextDateComptabilisation = new Date(
                        contrat.date_comptabilisation
                      );
                    }
                  }
                }
                await Contrat.findByIdAndUpdate(
                  { _id: contrat._id },
                  {
                    "etat_contrat.libelle": "Actif",
                    date_comptabilisation: nextDateComptabilisation,
                  }
                );
              }
            }
          })
          .catch((error) => {
            res.status(402).send({ message: error.message });
          });
      })
      .catch((error) => {
        res.status(402).send({
          message: `Aucun contrat suspendu trouvé : ${error.message}`,
        });
      });
  },

  lateContratTreatment: async (
    res,
    contrat,
    dateGenerationDeComptabilisation,
    periodicite,
    ContratSchema,
    Cloture,
    treatmentMonth,
    treatmentAnnee
  ) => {
    let isTreatmentEnded = false;
    let aggrigatedComptabilisationLoyer = [],
      aggrigatedOrdreVirement = [],
      comptabilisationLoyerDebiter = [],
      comptabilisationLoyer = [],
      ordreVirement = [],
      code;
    let lateContratTreatmentDate = {
      month: new Date(contrat.date_debut_loyer).getMonth() + 1,
      year: new Date(contrat.date_debut_loyer).getFullYear(),
    };
    let dureeAvanceInMonths = 0;
    let dureeAvanceToPay = 0;

    // Convert duree avance to months
    switch (contrat.periodicite_paiement) {
      case "mensuelle":
        dureeAvanceInMonths = contrat.duree_avance * 1;
        break;
      case "trimestrielle":
        dureeAvanceInMonths = contrat.duree_avance * 3;
        break;
      case "annuelle":
        dureeAvanceInMonths = contrat.duree_avance * 12;
        break;
    }

    // Remove avance months from overdued months
    for (let index = 0; index < dureeAvanceInMonths; index++) {
      // Get avance months if it's not overdued
      if (
        (lateContratTreatmentDate.month >= treatmentMonth &&
          lateContratTreatmentDate.year >= treatmentAnnee) ||
        lateContratTreatmentDate.year > treatmentAnnee
      ) {
        dureeAvanceToPay += 1;
      }

      lateContratTreatmentDate = incrementMonth(
        lateContratTreatmentDate.month,
        lateContratTreatmentDate.year
      );
    }

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
        const treatmentResult = await traitementCloture.traitementClotureActif(
          res,
          requestedContrat,
          dateGenerationDeComptabilisation,
          periodicite,
          ContratSchema,
          true,
          lateContratTreatmentDate.month,
          lateContratTreatmentDate.year
        );

        ordreVirement.push(...treatmentResult.ordre_virement);
        comptabilisationLoyer.push(...treatmentResult.cmptLoyerCrdt);

        if (
          lateContratTreatmentDate.month == treatmentMonth &&
          lateContratTreatmentDate.year == treatmentAnnee
        ) {
          isTreatmentEnded = true;
          aggrigatedOrdreVirement.push(
            ...sharedHelper.aggrigateOrderVirementObjects(ordreVirement, false)
          );
          aggrigatedComptabilisationLoyer.push(
            ...sharedHelper.aggrigateLoyerComptObjects(
              comptabilisationLoyer,
              false
            )
          );
        } else {
          if (lateContratTreatmentDate.month == 12) {
            lateContratTreatmentDate.month = 1;
            lateContratTreatmentDate.year = +lateContratTreatmentDate.year + 1;
            aggrigatedOrdreVirement.push(
              ...sharedHelper.aggrigateOrderVirementObjects(ordreVirement, true)
            );
            aggrigatedComptabilisationLoyer.push(
              ...sharedHelper.aggrigateLoyerComptObjects(
                comptabilisationLoyer,
                true
              )
            );
          } else {
            lateContratTreatmentDate.month =
              +lateContratTreatmentDate.month + 1;
          }
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
  },
};
