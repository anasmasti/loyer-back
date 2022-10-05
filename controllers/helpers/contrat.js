const Contrat = require("../../models/contrat/contrat.model");
const User = require("../../models/roles/roles.model");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const ProprietaireHelper = require("./proprietaire");
const mail = require("../../helpers/mail.send");
const AffectationProprietaire = require("../../models/affectation_proprietaire/affectation_proprietaire.schema");

module.exports = {
  createContratAV: async (
    req,
    res,
    ContratData,
    numeroContrat,
    existedContrat,
    isOverdued = false,
    piece_jointe_avenant
  ) => {
    function findProp(id) {
      let proprietaire = null;
      for (
        let index = 0;
        index < existedContrat.proprietaires.length;
        index++
      ) {
        const existedProprietaire = existedContrat.proprietaires[index];
        if (existedProprietaire._id.toString() == id.toString()) {
          proprietaire = existedProprietaire;
        }
      }
      return proprietaire;
    }
    // Update ( montant loyer )
    mntLoyer = ContratData.montant_loyer;
    for (
      let index = 0;
      index < ContratData.etat_contrat.etat.motif.length;
      index++
    ) {
      const motif = ContratData.etat_contrat.etat.motif[index];

      if (motif.type_motif == "Révision du prix du loyer") {
        mntLoyer = motif.montant_nouveau_loyer;
      }
    }

    const nouveauContrat = new Contrat({
      numero_contrat: numeroContrat,
      date_debut_loyer: ContratData.date_debut_loyer,
      date_fin_contrat: ContratData.date_fin_contrat,
      proprietaires: [],
      date_reprise_caution: ContratData.date_reprise_caution,
      date_premier_paiement: ContratData.date_premier_paiement,
      montant_loyer: mntLoyer,
      caution_versee: existedContrat.caution_versee,
      avance_versee: existedContrat.avance_versee,
      taxe_edilite_loyer: ContratData.taxe_edilite_loyer,
      taxe_edilite_non_loyer: ContratData.taxe_edilite_non_loyer,
      periodicite_paiement: ContratData.periodicite_paiement,
      duree_location: ContratData.duree_location,
      declaration_option: ContratData.declaration_option,
      taux_impot: ContratData.taux_impot,
      duree: ContratData.duree,
      retenue_source_par_mois: ContratData.retenue_source_par_mois,
      total_montant_brut_loyer: ContratData.total_montant_brut_loyer,
      total_montant_net_loyer: ContratData.total_montant_net_loyer,
      retenue_source: ContratData.retenue_source,
      montant_apres_impot: ContratData.montant_apres_impot,
      montant_caution: ContratData.montant_caution,
      duree_caution: ContratData.duree_caution,
      statut_caution: ContratData.statut_caution,
      montant_avance: ContratData.montant_avance,
      date_fin_avance: ContratData.date_fin_avance,
      duree_avance: ContratData.duree_avance,
      n_engagement_depense: ContratData.n_engagement_depense,
      echeance_revision_loyer: ContratData.echeance_revision_loyer,
      // date_comptabilisation: existedContrat.date_comptabilisation, // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      date_comptabilisation: isOverdued
        ? ContratData.etat_contrat.etat.date_effet_av
        : existedContrat.date_comptabilisation,
      foncier: ContratData.foncier,
      is_avenant: true,
      has_avenant: false,
      is_overdued: false,
      nombre_part: ContratData.nombre_part,
      etat_contrat: {
        libelle: "Initié",
        etat: {
          n_avenant: ContratData.etat_contrat.etat.n_avenant,
          is_avenant: true,
          motif: ContratData.etat_contrat.etat.motif,
          date_effet_av: ContratData.etat_contrat.etat.date_effet_av,
          piece_jointe_avenant: piece_jointe_avenant,
          deleted_proprietaires:
            ContratData.etat_contrat.etat.deleted_proprietaires,
          etat_contrat_rappel_montant_loyer_ea:
            ContratData.etat_contrat.etat.etat_contrat_rappel_montant_loyer_ea,
          etat_contrat_rappel_montant_loyer_ma:
            ContratData.etat_contrat.etat.etat_contrat_rappel_montant_loyer_ma,
          etat_contrat_rappel_montant_taxe_ea:
            ContratData.etat_contrat.etat.etat_contrat_rappel_montant_taxe_ea,
          etat_contrat_rappel_montant_taxe_ma:
            ContratData.etat_contrat.etat.etat_contrat_rappel_montant_taxe_ma,
          is_overdued_av: isOverdued,
          is_rappel_manuel: ContratData.etat_contrat.etat.is_rappel_manuel,
        },
      },
      old_contrat: [
        {
          contrat: req.params.Id,
        },
      ],
      piece_joint_contrat: piece_jointe_avenant,
    });
    await nouveauContrat
      .save()
      .then((newContrat) => {
        for (let j = 0; j < existedContrat.proprietaires.length; j++) {
          const proprietaire = existedContrat.proprietaires[j];
          let deletedProprietaire = [];

          // Get deleted proprietaire
          deletedProprietaire =
            ContratData.etat_contrat.etat.deleted_proprietaires;

          // Get mandataire
          if (proprietaire.is_mandataire) {
            // Check if deleted proprietaire not includes this mandataire
            if (!deletedProprietaire.includes(proprietaire._id.toString())) {
              // Add mandataire
              ProprietaireHelper.saveDuplicateProprietaire(
                proprietaire,
                true,
                null,
                newContrat
              )
                .then(async (proprietaireMandataire) => {
                  await Contrat.findByIdAndUpdate(
                    { _id: newContrat._id },
                    { $push: { proprietaires: proprietaireMandataire._id } }
                  ).catch((error) => {
                    res.status(422).send({
                      message: error.message,
                    });
                  });
                  // Get proprietaire list
                  for (
                    let index = 0;
                    index < proprietaire.proprietaire_list.length;
                    index++
                  ) {
                    // ForEach proprietaires
                    if (
                      !deletedProprietaire.includes(
                        proprietaire.proprietaire_list[index].toString()
                      )
                    ) {
                      let selectedProprietaire = findProp(
                        proprietaire.proprietaire_list[index]
                      );
                      ProprietaireHelper.saveDuplicateProprietaire(
                        selectedProprietaire,
                        false,
                        proprietaireMandataire._id,
                        newContrat
                      ).then(async (proprietaireNotMandataire) => {
                        await Contrat.findByIdAndUpdate(
                          { _id: newContrat._id },
                          {
                            $push: {
                              proprietaires: proprietaireNotMandataire._id,
                            },
                          }
                        ).catch((error) => {
                          res.status(422).send({
                            message: error.message,
                          });
                        });
                        // Push proprietaire in Mandataire proprietaire list
                        await AffectationProprietaire.findByIdAndUpdate(
                          { _id: proprietaireMandataire._id },
                          {
                            $push: {
                              proprietaire_list: proprietaireNotMandataire._id,
                            },
                          }
                        ).catch((error) => {
                          res.status(422).send({
                            message: error.message,
                          });
                        });
                      });
                    }
                  }
                })
                .catch((error) => {
                  res.status(422).send({
                    message: error.message,
                  });
                });
            }

            // Check if deleted proprietaire includes this mandataire
            else {
              // Then Add proprietaire
              proprietaire.proprietaire_list.forEach(
                (proprietaireHasntMandataire) => {
                  let selectedProprietaire = findProp(
                    proprietaireHasntMandataire
                  );
                  if (
                    !deletedProprietaire.includes(
                      selectedProprietaire._id.toString()
                    )
                  ) {
                    ProprietaireHelper.saveDuplicateProprietaire(
                      selectedProprietaire,
                      false,
                      null,
                      newContrat
                    ).then(async (proprietaire) => {
                      await Contrat.findByIdAndUpdate(
                        { _id: newContrat._id },
                        { $push: { proprietaires: proprietaire._id } }
                      ).catch((error) => {
                        res.status(422).send({
                          message: error.message,
                        });
                      });
                    });
                  }
                }
              );
            }
          }
        }

        Contrat.findByIdAndUpdate(
          { _id: existedContrat._id },
          { has_avenant: true }
        ).catch((error) => {
          res.status(400).send({ message: error.message });
          console.log(error.message);
        });
      })
      .catch((error) => {
        res.status(400).send({ message: error.message });
      });
  },

  deleteProprietaire: async (req, res, proprietareId) => {
    await AffectationProprietaire.findByIdAndUpdate(proprietareId, {
      deleted: true,
    }).catch((error) => {
      res.status(400).send({ message: error.message });
    });
  },

  proprietaireDeces: async (req, res, proprietareId) => {
    await AffectationProprietaire.findByIdAndUpdate(proprietareId, {
      statut: "Décès",
    }).catch((error) => {
      res.status(400).send({ message: error.message });
    });
  },

  storeFiles: async (req, fileName) => {
    let storedFiles = [];
    for (let i = 0; i < 8; i++) {
      let file = req.files[`${fileName}${i + 1}`];
      if (file) {
        storedFiles.push({
          image: file[0].path,
        });
      }
    }
    return storedFiles;
  },

  sendMailToAll: async (contratId) => {
    await Contrat.findOne({ _id: contratId, deleted: false })
      .populate({
        path: "foncier",
        populate: {
          path: "proprietaire",
          populate: { path: "proprietaire_list" },
        },
      })
      .then(async (contrat) => {
        await User.aggregate([
          {
            $match: {
              deleted: false,
              userRoles: {
                $elemMatch: {
                  deleted: false,
                  $or: [
                    {
                      roleCode: "DAJC",
                    },
                    {
                      roleCode: "CDGSP",
                    },
                    {
                      roleCode: "CSLA",
                    },
                  ],
                },
              },
            },
          },
        ])
          .then(async (data_) => {
            let DAJCemailsList = [];
            for (let i = 0; i < data_.length; i++) {
              DAJCemailsList.push(data_[i].email);
            }

            let contratName;
            if (contrat.is_avenant) {
              contratName = "Avenant";
            }
            if (!contrat.is_avenant) {
              contratName = "Le contrat";
            }

            let DAJCmailData = {
              message: `${contratName} n°${contrat.numero_contrat} ( ${contrat.foncier.type_lieu} ) a été validé.`,
            };

            if (DAJCemailsList.length > 0) {
              mail.sendMail(
                `${DAJCemailsList.join()}`,
                "Contrat validé",
                "validation1",
                DAJCmailData
              );
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(400).send({ message: error.message });
          });
      });
  },

  generateNumeroContrat: (numeroContrat) => {
    let splitedNumeroContrat = numeroContrat.split("/");
    if (splitedNumeroContrat[splitedNumeroContrat.length - 1].includes("AV")) {
      let countedAV = splitedNumeroContrat[
        splitedNumeroContrat.length - 1
      ].replace("AV", "");
      splitedNumeroContrat[splitedNumeroContrat.length - 1] = `AV${
        +countedAV + 1
      }`;
    } else {
      splitedNumeroContrat[splitedNumeroContrat.length] = "AV1";
    }
    return splitedNumeroContrat.join("/").toString();
  },

  checkContratDate: (targetDate, targetDateFin) => {
    let _targetDateFin = new Date(targetDateFin);
    let targetDateFinMonth = _targetDateFin.getMonth() + 1;
    let targetDateFinYear = _targetDateFin.getFullYear();

    let _targetDate = new Date(targetDate);
    let targetDateMonth = _targetDate.getMonth() + 1;
    let targetDateYear = _targetDate.getFullYear();

    if (
      // (targetDateMonth == targetDateFinMonth &&
      //   targetDateYear == targetDateFinYear) ||
      (targetDateMonth > targetDateFinMonth &&
        targetDateYear < targetDateFinYear) ||
      (targetDateMonth < targetDateFinMonth &&
        targetDateYear <= targetDateFinYear)
    ) {
      return true;
    } else {
      return false;
    }
  },
};
