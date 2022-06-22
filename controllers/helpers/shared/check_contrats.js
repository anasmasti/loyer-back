const Contrat = require("../../../models/contrat/contrat.model");
const ContratHelper = require("../contrat");
const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");
const proprietaireHelper = require("../proprietaire");
const archiveVirement = require("../../../models/archive/archiveVirement.schema");
const incrementMonth = require("./increment_month");
const sharedHelper = require("./aggrigationObjects");
const clotureHelper = require("./cloture_helper");
const lateContratTreatment = require("../cloture/contrats_en_retard");
const TreatmentDate = require("../shared/treatmentDate");

module.exports = {
  checkContratsAv: async (req, res) => {
    await Contrat.findOne({
      "etat_contrat.libelle": "Planifié",
      deleted: false,
    })
      .populate({
        path: "old_contrat.contrat",
        match: { deleted: false, "etat_contrat.libelle": "Actif" },
      })
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

          let treatmentDate = await TreatmentDate(req, res);

          let treatmentMonth = treatmentDate.getMonth() + 1;
          let treatmentYear = treatmentDate.getFullYear();
          let dateDeffetAV = new Date(
            contratAV.etat_contrat.etat.date_effet_av
          );
          let dateDeffetAVMonth = dateDeffetAV.getMonth() + 1;
          let dateDeffetAVYear = dateDeffetAV.getFullYear();

          if (
            (dateDeffetAVMonth <= treatmentMonth &&
              dateDeffetAVYear == treatmentYear) ||
            dateDeffetAVYear < treatmentYear
          ) {
            if (oldContrats.length > 0) {
              // Get the old contrat
              try {
                oldContrat = oldContrats.find((contrat) => {
                  return contrat.contrat.etat_contrat.libelle == "Actif";
                }).contrat;
              } catch (error) {
                res.status(412).send({ message: "Aucun contrat actif trouvé" });
              }

              // the old contrat etat
              etatOldContrat = {
                libelle: "Modifié",
                etat: oldContrat.etat_contrat.etat,
              };

              // the new contrat etat
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
                    contratAV.etat_contrat.etat.deleted_proprietaires.length > 0
                  ) {
                    for (
                      let index = 0;
                      index <
                      contratAV.etat_contrat.etat.deleted_proprietaires.length;
                      index++
                    ) {
                      const proprietaire =
                        contratAV.etat_contrat.etat.deleted_proprietaires[
                          index
                        ];

                      ContratHelper.proprietaireDeces(req, res, proprietaire);
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
                    const isLessThan = ContratHelper.checkContratDate(
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
                      ContratHelper.checkContratDate(
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

  checkContratsOverdued: async (
    res,
    contratSchema,
    treatmentMonth,
    treatmentAnnee,
    Cloture,
    dateGenerationDeComptabilisation
  ) => {
    let orderVirement = [],
      comptabilisationLoyer = [],
      comptabilisationLoyerDebt = [];

    try {
      //get current contrat of this month
      let contrats = await Contrat.find({
        deleted: false,
        is_overdued: true,
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
        })
        .sort({ updatedAt: "desc" });

      for (let index = 0; index < contrats.length; index++) {
        const contrat = contrats[index];

        let lateContratTreatmentDate = {
          month: new Date(contrat.date_debut_loyer).getMonth() + 1,
          year: new Date(contrat.date_debut_loyer).getFullYear(),
        };
        let dureeAvanceToPay = 0;

        let result = clotureHelper.removeAvanceFromRappel(
          lateContratTreatmentDate,
          { treatmentMonth, treatmentAnnee },
          contrat
        );

        // console.log("Contrat", contrat);
        lateContratTreatmentDate = result.lateContratTreatmentDate;
        dureeAvanceToPay = result.dureeAvanceToPay;

        let treatmentResult = await lateContratTreatment(
          res,
          contrat,
          dateGenerationDeComptabilisation,
          contrat.periodicite_paiement,
          contratSchema,
          Cloture,
          treatmentMonth,
          treatmentAnnee,
          lateContratTreatmentDate,
          dureeAvanceToPay
        );

        orderVirement.push(...treatmentResult.ordre_virement);
        comptabilisationLoyer.push(...treatmentResult.cmptLoyerCrdt);
        comptabilisationLoyerDebt.push(...treatmentResult.cmptLoyerDebt);
      }
    } catch (error) {
      console.log(error);
    }

    return {
      ordre_virement: orderVirement,
      cmptLoyerCrdt: comptabilisationLoyer,
      cmptLoyerDebt: comptabilisationLoyerDebt,
    };
  },
};
