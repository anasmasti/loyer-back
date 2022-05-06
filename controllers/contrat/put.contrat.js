const Contrat = require("../../models/contrat/contrat.model");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const Foncier = require("../../models/foncier/foncier.model");
const User = require("../../models/roles/roles.model");
const mail = require("../../helpers/mail.send");
const Calcule = require("../helpers/calculProprietaire");
const ContratHelper = require("../helpers/contrat");
const FilesHelper = require("../helpers/files");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");

module.exports = {
  modifierContrat: async (req, res) => {
    let item = 0,
      piece_joint_contrat = [],
      images_etat_res_lieu_sortie = [],
      lettre_res_piece_jointe = [],
      piece_jointe_avenant = [],
      etatContrat = {},
      updateContrat = {},
      contrats_suspendu = [],
      contrat_avener = [],
      nextDateComptabilisation = null,
      data = null,
      isMotifMontantLoyerChanged = false,
      newMotifMontantLoyer = 0;

    try {
      data = JSON.parse(req.body.data);
      // data = req.body.data;
    } catch (error) {
      res.status(422).send({ message: error.message });
    }

    // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Contrat ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    //store files
    if (req.files) {
      // piece_jointe_contrat
      piece_joint_contrat = await FilesHelper.storeFiles(
        req,
        "piece_joint_contrat"
      );

      // images_etat_res_lieu_sortie
      images_etat_res_lieu_sortie = await FilesHelper.storeFiles(
        req,
        "images_etat_res_lieu_sortie"
      );

      // lettre_res_piece_jointe
      lettre_res_piece_jointe = await FilesHelper.storeFiles(
        req,
        "lettre_res_piece_jointe"
      );

      // piece_jointe_avenant
      piece_jointe_avenant = await FilesHelper.storeFiles(
        req,
        "piece_jointe_avenant"
      );
    }

    //search for requested contrat
    let existedContrat = await Contrat.findById(req.params.Id).populate({
      path: "foncier",
    });

    //checking and store etats
    if (data.etat_contrat.libelle === "Avenant") {
      let numeroContrat = ContratHelper.generateNumeroContrat(numeroContrat);

      ContratHelper.createContratAV(
        req,
        res,
        data,
        numeroContrat,
        piece_jointe_avenant
      );
      etatContrat = {
        libelle: "Actif",
        etat: {},
      };
    } else if (
      data.etat_contrat.libelle === "Suspendu" ||
      data.etat_contrat.libelle === "toactivate"
    ) {
      etatContrat = {
        libelle: "Suspendu",
        etat: {
          intitule_lieu: data.etat_contrat.etat.intitule_lieu,
          date_suspension: data.etat_contrat.etat.date_suspension,
          duree_suspension: data.etat_contrat.etat.duree_suspension,
          motif_suspension: data.etat_contrat.etat.motif_suspension,
          date_fin_suspension: data.etat_contrat.etat.date_fin_suspension,
        },
      };

      if (
        data.etat_contrat.etat.duree_suspension != null &&
        data.etat_contrat.etat.duree_suspension > 0
      ) {
        if (existedContrat.date_comptabilisation != null) {
          const isLessThen = ContratHelper.chackContratDate(
            existedContrat.date_comptabilisation,
            data.etat_contrat.etat.date_fin_suspension
          );
          if (isLessThen) {
            nextDateComptabilisation = new Date(
              data.etat_contrat.etat.date_fin_suspension
            );
          } else {
            nextDateComptabilisation = new Date(
              existedContrat.date_comptabilisation
            );
          }
        } else {
          if (
            ContratHelper.chackContratDate(
              data.date_premier_paiement,
              data.etat_contrat.etat.date_fin_suspension
            )
          )
            nextDateComptabilisation = new Date(
              data.etat_contrat.etat.date_fin_suspension
            );
        }
      }
    } else if (data.etat_contrat.libelle === "Résilié") {
      etatContrat = {
        libelle: data.etat_contrat.libelle,
        etat: {
          intitule_lieu: data.etat_contrat.etat.intitule_lieu,
          reprise_caution: data.etat_contrat.etat.reprise_caution,
          etat_caution_consomme: data.etat_caution_consomme,
          duree_consomme: data.duree_consomme,
          duree_a_recuperer: data.duree_a_recuperer,
          date_resiliation: data.etat_contrat.etat.date_resiliation,
          etat_lieu_sortie: data.etat_contrat.etat.etat_lieu_sortie,
          preavis: data.etat_contrat.etat.preavis,
          frais_reamenagement: data.etat_contrat.etat.frais_reamenagement,
          images_etat_res_lieu_sortie: images_etat_res_lieu_sortie,
          lettre_res_piece_jointe: lettre_res_piece_jointe,
        },
      };

      // let dateResiliation = new Date(data.etat_contrat.etat.date_resiliation)
      // nextDateComptabilisation = dateResiliation.setMonth(dateResiliation.getMonth() - data.etat_contrat.etat.duree_consomme)

      // if (data.etat_contrat.etat.reprise_caution == 'Consommée') {

      //     if (data.etat_contrat.etat.etat_caution_consomme == 'partiellement') {

      //         //set the next date de comptabilisation if contrat resilie
      //         let dateResiliation = new Date(data.etat_contrat.etat.date_resiliation);

      //         nextDateComptabilisation = dateResiliation.setMonth(dateResiliation.getMonth() - data.etat_contrat.etat.duree_consomme)
      //         console.log('next date comptabilisation', nextDateComptabilisation);

      //     } else if (data.etat_contrat.etat.etat_caution_consomme == 'totalement') {

      //         //set the next date de comptabilisation if contrat resilie
      //         let dateResiliation = new Date(data.etat_contrat.etat.date_resiliation)
      //         nextDateComptabilisation = dateResiliation.setMonth(dateResiliation.getMonth() - data.duree_caution)

      //     }
      // }
    } else if (data.etat_contrat.libelle === "Actif") {
      etatContrat = {
        libelle: data.etat_contrat.libelle,
        etat: {},
      };
      nextDateComptabilisation = existedContrat.date_comptabilisation;
      // data.etat_contrat;
    } else if (data.etat_contrat.libelle === "Initié" && !data.is_avenant) {
      etatContrat = data.etat_contrat;
    }

    if (data.is_avenant && data.etat_contrat.libelle === "Initié") {
      etatContrat = {
        libelle: data.etat_contrat.libelle,
        etat: {
          n_avenant: data.etat_contrat.etat.n_avenant,
          motif: data.etat_contrat.etat.motif,
          date_effet_av: data.etat_contrat.etat.date_effet_av,
          deleted_proprietaires: data.etat_contrat.etat.deleted_proprietaires,
        },
      };

      data.etat_contrat.etat.motif.forEach((motif) => {
        if (motif.type_motif == "Révision du prix du loyer") {
          isMotifMontantLoyerChanged = true;
          newMotifMontantLoyer = motif.montant_nouveau_loyer;
        }

        if (motif.type_motif == "Décès" || motif.type_motif == "Cession") {
          if (data.etat_contrat.etat.deleted_proprietaires.length > 0) {
            data.etat_contrat.etat.deleted_proprietaires.forEach(
              async (proprietaire) => {
                await Proprietaire.findByIdAndUpdate(
                  { _id: proprietaire },
                  { statut: "À supprimer" }
                );
              }
            );
          }
        }
      });
    }

    updateContrat = {
      date_debut_loyer: data.date_debut_loyer,
      date_fin_contrat: data.date_fin_contrat,
      date_reprise_caution: data.date_reprise_caution,
      date_fin_avance: data.date_fin_avance,
      date_premier_paiement: data.date_premier_paiement,
      montant_loyer: isMotifMontantLoyerChanged
        ? newMotifMontantLoyer
        : data.montant_loyer,
      taxe_edilite_loyer: data.taxe_edilite_loyer,
      taxe_edilite_non_loyer: data.taxe_edilite_non_loyer,
      periodicite_paiement: data.periodicite_paiement,
      duree_location: data.duree_location,
      declaration_option: data.declaration_option,
      taux_impot: data.taux_impot,
      duree: data.duree,
      retenue_source_par_mois: data.retenue_source_par_mois,
      total_montant_brut_loyer: data.total_montant_brut_loyer,
      total_montant_net_loyer: data.total_montant_net_loyer,
      retenue_source: data.retenue_source,
      montant_apres_impot: data.montant_apres_impot,
      montant_caution: data.montant_caution,
      duree_caution: data.duree_caution,
      statut_caution:
        data.etat_contrat.libelle == "Résilié"
          ? data.etat_contrat.etat.reprise_caution
          : data.statut_caution,
      montant_avance: data.montant_avance,
      duree_avance: data.duree_avance,
      n_engagement_depense: data.n_engagement_depense,
      echeance_revision_loyer: data.echeance_revision_loyer,
      // lieu: data.lieu,
      etat_contrat: etatContrat,
      piece_joint_contrat: piece_joint_contrat,
      date_comptabilisation: nextDateComptabilisation,
      nombre_part: data.nombre_part,
    };

    // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Proprietaire ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    // Recalculate ( Proprietaire ) montant & taxes if ( Montant loyer changed )
    if (existedContrat.montant_loyer != data.montant_loyer) {
      await Contrat.find({ _id: req.params.Id, deleted: false })
        .populate({ path: "foncier", populate: { path: "proprietaire" } })
        .then(async (data_) => {
          for (let i = 0; i < data_[0].foncier.proprietaire.length; i++) {
            let partProprietaire =
              data_[0].foncier.proprietaire[i].part_proprietaire;
            let idProprietaire = data_[0].foncier.proprietaire[i]._id;
            let updatedContrat = data;
            let hasDeclarationOption =
              data_[0].foncier.proprietaire[i].declaration_option;

            let updatedProprietaire = Calcule(
              updatedContrat,
              partProprietaire,
              idProprietaire,
              hasDeclarationOption
            );

            await Proprietaire.findByIdAndUpdate(
              idProprietaire,
              updatedProprietaire
            )
              .then((data) => {
                // res.json(data);
                console.log("Proprietaire updated");
              })
              .catch((error) => {
                res.status(400).send({ message: error.message });
              });
          }
        })
        .catch((error) => {
          res.status(422).send({
            message: error.message,
          });
        });
    }

    // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Foncier ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    // Make the lieu that attached to this foncier (transféré) if contrat résilié
    if (data.etat_contrat.libelle === "Résilié") {
      await Foncier.findOne({ _id: existedContrat.foncier._id }).then(
        async (foncier) => {
          let lieux = [];
          foncier.lieu.forEach((lieu) => {
            if (!lieu.deleted) {
              let updatedLieu = {
                deleted: false,
                etat_lieu: "Transférée",
                lieu: lieu.lieu,
              };
              lieux.push(updatedLieu);
            } else {
              lieux.push(lieu);
            }
          });
          await Foncier.findByIdAndUpdate(
            { _id: existedContrat.foncier._id },
            { lieu: lieux }
          );
        }
      );
    }

    // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Mails ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    // Sending mail to All the DC (Département Comptable) roles if contrat résilié and suspendu
    if (
      data.etat_contrat.libelle === "Résilié" ||
      data.etat_contrat.libelle === "Suspendu"
    ) {
      await Contrat.findById({ _id: existedContrat._id, deleted: false })
        .populate({
          path: "foncier",
          populate: {
            path: "lieu",
            populate: { path: "lieu" },
            match: { deleted: false },
          },
        })
        .then(async (contratData) => {
          // let contratName ;
          // if(existedContrat.is_avenant){
          //   contratName = 'Avenant'
          // }
          // if(!existedContrat.is_avenant){
          //   contratName = 'Le contrat de bail'
          // }
          let mailData;
          let mailObject;
          if (data.etat_contrat.libelle === "Résilié") {
            mailObject = "Résiliation de contrat";
            mailData = {
              message: `La résiliation du contrat n° ${
                contratData.numero_contrat
              } (${contratData.foncier.type_lieu}) est effectuée${
                data.etat_contrat.etat.date_resiliation
                  ? ", et ce à partir du " +
                    data.etat_contrat.etat.date_resiliation
                  : " "
              }`,
            };
          }
          if (data.etat_contrat.libelle === "Suspendu") {
            mailObject = "Suspension du contrat";
            mailData = {
              message: `Le contrat de bail n° ${contratData.numero_contrat} (${contratData.foncier.type_lieu}) a été suspendu à partir du ${data.etat_contrat.etat.date_suspension}.`,
            };
          }

          let emailsList = [];

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
                      {
                        roleCode: "DC",
                      },
                    ],
                  },
                },
              },
            },
          ])
            .then((data) => {
              for (let i = 0; i < data.length; i++) {
                emailsList.push(data[i].email);
              }
            })
            .catch((error) => {
              // console.log(error);
              res.status(400).send({ message: error.message });
            });
          if (emailsList.length > 0) {
            mail.sendMail(
              `${emailsList.join()}`,
              mailObject,
              "validation1",
              mailData
            );
          }
        })
        .catch((error) => {
          res.status(400).send({ message: error.message });
        });
    }

    // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Save Data ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    // Save Updated data
    await Contrat.findByIdAndUpdate(req.params.Id, updateContrat, { new: true })
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(400).send({ message: error.message });
      });
  },

  modifierValidationDMG: async (req, res) => {
    let DAJCemailsList = [];
    let CDGSPemailsList = [];
    // Sending mail to All the DAJC (Direction Affaires Juridiques et Conformité) roles
    await Contrat.findByIdAndUpdate(req.params.Id, {
      validation1_DMG: true,
    }).then(async (updatedContrat) => {
      await Contrat.findOne({ _id: req.params.Id, deleted: false })
        .populate({
          path: "foncier",
          populate: {
            path: "proprietaire",
            populate: { path: "proprietaire_list" },
          },
        })
        .then(async (contrat) => {
          // Sending mail to DAJC (V2)
          await User.aggregate([
            {
              $match: {
                deleted: false,
                userRoles: {
                  $elemMatch: {
                    roleCode: "DAJC",
                    deleted: false,
                  },
                },
              },
            },
          ])
            .then((data_) => {
              for (let i = 0; i < data_.length; i++) {
                DAJCemailsList.push(data_[i].email);
              }
            })
            .catch((error) => {
              console.error(error);
              res.status(400).send({ message: error.message });
            });

          let contratName;
          if (contrat.is_avenant) {
            contratName = "Avenant";
          }
          if (!contrat.is_avenant) {
            contratName = "Le contrat";
          }

          let DAJCmailData = {
            message: `${contratName} n°${contrat.numero_contrat} ( ${contrat.foncier.type_lieu} ) est crée et en attente de validation.`,
          };

          if (DAJCemailsList.length > 0) {
            mail.sendMail(
              `${DAJCemailsList.join()}`,
              "Contrat à valider",
              "validation1",
              DAJCmailData
            );
          }
        });
    });
  },

  modifierValidationDAJC: async (req, res) => {
    await Contrat.findOne({ _id: req.params.Id, deleted: false })
      .populate({ path: "old_contrat.contrat" })
      .then(async (data) => {
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
            if (oldContrats.length > 0) {
              // Get the old contrat
              oldContrat = oldContrats.find((contrat) => {
                return contrat.contrat.etat_contrat.libelle == "Actif";
              }).contrat;

              // Get old contrat's final date by subtracting 1 day from date d'effet av
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

                // Delete proprietaires
                if (
                  contratAV.etat_contrat.etat.deleted_proprietaires.length > 0
                ) {
                  contratAV.etat_contrat.etat.deleted_proprietaires.forEach(
                    (proprietaire) => {
                      ContratHelper.deleteProprietaire(req, res, proprietaire);
                    }
                  );
                }

                // Recalculate ( Proprietaire ) montant & taxes if ( Montant loyer changed )
                await Contrat.find({ _id: contratAV._id, deleted: false })
                  .populate({
                    path: "foncier",
                    populate: { path: "proprietaire" },
                  })
                  .then(async (data_) => {
                    for (
                      let i = 0;
                      i < data_[0].foncier.proprietaire.length;
                      i++
                    ) {
                      let partProprietaire =
                        data_[0].foncier.proprietaire[i].part_proprietaire;
                      let idProprietaire = data_[0].foncier.proprietaire[i]._id;
                      let updatedContrat = data_[0];
                      let hasDeclarationOption =
                        data_[0].foncier.proprietaire[i].declaration_option;

                      let updatedProprietaire = Calcule(
                        updatedContrat,
                        partProprietaire,
                        idProprietaire,
                        hasDeclarationOption
                      );

                      await Proprietaire.findByIdAndUpdate(
                        idProprietaire,
                        updatedProprietaire
                      )
                        .then((prop) => {
                          // res.json(data);
                          console.log("Proprietaire updated");
                        })
                        .catch((error) => {
                          res.status(400).send({ message: error.message });
                        });
                    }
                  })
                  .catch((error) => {
                    res.status(422).send({
                      message: error.message,
                    });
                  });

                await Foncier.findById({
                  _id: contratAV.foncier,
                  deleted: false,
                })
                  .populate({
                    path: "proprietaire",
                    match: { deleted: false, statut: "À ajouter" },
                  })
                  .then((foncier) => {
                    foncier.proprietaire.forEach(async (proprietaire) => {
                      await Proprietaire.findByIdAndUpdate(
                        { _id: proprietaire._id },
                        { statut: "Actif" }
                      );
                    });
                  });

                // Change is_avenant to false
              } else {
                // Customise the old contrat etat
                etatOldContrat = oldContrat.etat_contrat;
                // Customise the new contrat etat
                etatNewContrat = {
                  libelle: "Test",
                  etat: contratAV.etat_contrat.etat,
                };
              }
              // Update the old contrat
              await Contrat.findByIdAndUpdate(oldContrat._id, {
                // date_fin_contrat: dateFinOldContrat,
                etat_contrat: etatOldContrat,
              });

              // Update the AV contrat
              await Contrat.findByIdAndUpdate(req.params.Id, {
                date_comptabilisation: oldContrat.date_comptabilisation,
                etat_contrat: etatNewContrat,
                validation2_DAJC: true,
              })
                .then(async () => {
                  // Sending mail to DAJC, CDGSP and CSLA
                  ContratHelper.sendMailToAll(req.params.Id);
                })
                .catch((error) => {
                  console.error(error.message);
                });
            } else {
              let etatContrat = {
                libelle: "Actif",
                etat: {},
              };

              await Contrat.findByIdAndUpdate(req.params.Id, {
                validation2_DAJC: true,
                etat_contrat: etatContrat,
              }).then(async (updatedContrat) => {
                // Sending mail to DAJC, CDGSP and CSLA
                ContratHelper.sendMailToAll(req.params.Id);
              });
            }
            // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
          })
          .catch((error) => {
            res.status(402).send({ message: error.message });
          });
      });
  },

  soumettre: async (req, res) => {
    await Contrat.findOne({ _id: req.params.Id, deleted: false })
      .populate({
        path: "foncier",
      })
      .populate({
        path: "proprietaires",
        populate: {
          path: "proprietaire_list",
          match: { deleted: false },
        },
        match: { deleted: false },
      })
      .then(async (data) => {
        let partGlobal = data.nombre_part;
        let partProprietaireGlobal = 0;
        // If some one is / has not a mandataire this variable will be true
        let hasnt_mandataire = false;
        data.proprietaires.forEach((proprietaire) => {
          partProprietaireGlobal += proprietaire.part_proprietaire;
          if (!proprietaire.has_mandataire && !proprietaire.is_mandataire) {
            hasnt_mandataire = true;
          }
        });

        if (partProprietaireGlobal == partGlobal && !hasnt_mandataire) {
          let etatContrat = {
            libelle: "En cours de validation",
            etat: data.etat_contrat.etat,
          };

          await Contrat.findByIdAndUpdate(req.params.Id, {
            etat_contrat: etatContrat,
          });

          // Sending mail to CDGSP
          let mailData;
          if (data.is_avenant) {
            mailData = {
              message:
                "L'avenant n°" +
                data.numero_contrat +
                " ( " +
                data.foncier.type_lieu +
                " ) est crée et soumis à la validation.",
            };
          } else {
            mailData = {
              message:
                "Le contrat n°" +
                data.numero_contrat +
                " ( " +
                data.foncier.type_lieu +
                " ) est crée et soumis à la validation.",
            };
          }

          let emailsList = [];

          await User.aggregate([
            {
              $match: {
                deleted: false,
                userRoles: {
                  $elemMatch: {
                    roleCode: "CDGSP",
                    deleted: false,
                  },
                },
              },
            },
          ])
            .then((data) => {
              for (let i = 0; i < data.length; i++) {
                emailsList.push(data[i].email);
              }
            })
            .catch((error) => {
              res.status(400).send({ message: error.message });
            });
          if (emailsList.length > 0) {
            mail.sendMail(
              `${emailsList.join()}`,
              "Contrat à valider",
              "validation1",
              mailData
            );
          }
          res.json({ message: "Contrat soumis à la validation." });
          // console.log({
          //   partGlobal: partGlobal,
          //   partProp: partProprietaireGlobal,
          //   hasnt_mandataire: hasnt_mandataire,
          // });
        } else {
          // console.log({
          //   partGlobal: partGlobal,
          //   partProp: partProprietaireGlobal,
          //   hasnt_mandataire: hasnt_mandataire,
          // });
          res
            .status(400)
            .send({ message: "Prière de verifier les données saisies." });
        }
      });
  },

  annulerContrat: async (req, res) => {
    let etatContrat = {
      libelle: "Initié",
      etat: {},
    };
    await Contrat.findByIdAndUpdate(req.params.Id, {
      validation1_DMG: false,
      validation2_DAJC: false,
      etat_contrat: etatContrat,
    })
      .populate({
        path: "foncier",
        populate: {
          path: "proprietaire",
          populate: { path: "proprietaire_list" },
        },
      })
      .then(async (contrat) => {
        // Sending mail to CDGSP
        let mailData;
        if (data.is_avenant) {
          mailData = {
            message: `Avenant N°${contrat.numero_contrat}. (${contrat.foncier.type_lieu}) a été rejeté`,
          };
        } else {
          mailData = {
            message: `Le contrat N°${contrat.numero_contrat}. (${contrat.foncier.type_lieu}) a été rejeté`,
          };
        }

        let emailsList = [];

        await User.aggregate([
          {
            $match: {
              deleted: false,
              userRoles: {
                $elemMatch: {
                  deleted: false,
                  $or: [
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
          .then((data) => {
            for (let i = 0; i < data.length; i++) {
              emailsList.push(data[i].email);
            }
          })
          .catch((error) => {
            res.status(400).send({ message: error.message });
          });
        if (emailsList.length > 0) {
          mail.sendMail(
            `${emailsList.join()}`,
            "Contrat à valider",
            "validation1",
            mailData
          );
        }
      });
  },
};
