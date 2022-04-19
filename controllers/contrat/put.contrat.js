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
      isMotifMontantLoyer = false,
      newMotifMontantLoyer = 0;

    // console.log(req.body.data);
    try {
      data = JSON.parse(req.body.data);
    } catch (error) {
      res.status(422).send({ message: error.message });
    }
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

    // // store the exited files
    // if (existedContrat) {
    //   if (
    //     existedContrat.piece_joint_contrat &&
    //     piece_joint_contrat.length == 0
    //   ) {
    //     for (item in existedContrat.piece_joint_contrat) {
    //       piece_joint_contrat.push({
    //         image: existedContrat.piece_joint_contrat[item].image,
    //       });
    //     }
    //   }
    //   if (
    //     existedContrat.etat_contrat.etat.images_etat_res_lieu_sortie &&
    //     images_etat_res_lieu_sortie.length == 0
    //   ) {
    //     for (item in existedContrat.etat_contrat.etat
    //       .images_etat_res_lieu_sortie) {
    //       images_etat_res_lieu_sortie.push({
    //         image:
    //           existedContrat.etat_contrat.etat.images_etat_res_lieu_sortie[item]
    //             .image,
    //       });
    //     }
    //   }
    //   if (
    //     existedContrat.etat_contrat.etat.lettre_res_piece_jointe &&
    //     lettre_res_piece_jointe.length == 0
    //   ) {
    //     for (item in existedContrat.etat_contrat.etat.lettre_res_piece_jointe) {
    //       lettre_res_piece_jointe.push({
    //         image:
    //           existedContrat.etat_contrat.etat.lettre_res_piece_jointe[item]
    //             .image,
    //       });
    //     }
    //   }
    //   if (
    //     existedContrat.etat_contrat.etat.piece_jointe_avenant &&
    //     piece_jointe_avenant.length == 0
    //   ) {
    //     for (item in existedContrat.etat_contrat.etat.piece_jointe_avenant) {
    //       piece_jointe_avenant.push({
    //         image:
    //           existedContrat.etat_contrat.etat.piece_jointe_avenant[item].image,
    //       });
    //     }
    //   }
    // }

    //checking and store etats
    if (data.etat_contrat.libelle === "Avenant") {
      // let numeroContrat = data.numero_contrat.replace("AV", "");
      let numeroContrat = data.numero_contrat;
      ContratHelper.createContratAV(
        req,
        res,
        data,
        `${numeroContrat}/AV`,
        piece_jointe_avenant
      );
      etatContrat = {
        libelle: "Actif",
        etat: {},
      };
    } else if (data.etat_contrat.libelle === "Suspendu") {
      etatContrat = {
        libelle: data.etat_contrat.libelle,
        etat: {
          intitule_lieu: data.etat_contrat.etat.intitule_lieu,
          date_suspension: data.etat_contrat.etat.date_suspension,
          duree_suspension: data.etat_contrat.etat.duree_suspension,
          motif_suspension: data.etat_contrat.etat.motif_suspension,
          date_fin_suspension: data.etat_contrat.etat.date_fin_suspension,
        },
      };

      //set the next date de comptabilisation if contrat suspendu
      let dureeSuspension = data.etat_contrat.etat.duree_suspension;
      let dateComptabilisation = new Date(data.date_comptabilisation);
      // console.log(
      //   "date comptabilisation etat suspendu ==>",
      //   dateComptabilisation
      // );
      if (data.date_comptabilisation != null) {
        nextDateComptabilisation = dateComptabilisation.setMonth(
          dateComptabilisation.getMonth() + dureeSuspension
        );
        // console.log(nextDateComptabilisation);
      } else {
        nextDateComptabilisation = null;
        // console.log(nextDateComptabilisation);
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
      etatContrat = data.etat_contrat;
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
          isMotifMontantLoyer = true;
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

    // store existed Suspendu contrat
    for (item in existedContrat.contrats_suspendu) {
      contrats_suspendu.push(existedContrat.contrats_suspendu[item]);
    }
    if (existedContrat.etat_contrat.libelle == "Suspendu") {
      contrats_suspendu.push(existedContrat);
    }

    //store existed Avenant contrat
    for (item in existedContrat.contrat_avener) {
      contrat_avener.push(existedContrat.contrat_avener[item]);
    }
    if (existedContrat.etat_contrat.libelle == "Avenant") {
      contrat_avener.push(existedContrat);
    }

    //add attribute 'AV' in contrat if etat = Avenant
    if (data.etat_contrat.libelle == "Avenant") {
      if (data.validation1_DMG == true && data.validation2_DAJC == true) {
        let numContratData = data.numero_contrat;
        let numeroContrat = numContratData;
        updateContrat = {
          numero_contrat: numeroContrat,
          date_debut_loyer: data.date_debut_loyer,
          date_fin_contrat: data.date_fin_contrat,
          date_reprise_caution: data.date_reprise_caution,
          date_fin_avance: data.date_fin_avance,
          date_premier_paiement: data.date_premier_paiement,
          montant_loyer: data.montant_loyer,
          taxe_edilite_loyer: data.taxe_edilite_loyer,
          taxe_edilite_non_loyer: data.taxe_edilite_non_loyer,
          periodicite_paiement: data.periodicite_paiement,
          duree_location: data.duree_location,
          duree: data.duree,
          retenue_source_par_mois: data.retenue_source_par_mois,
          total_montant_brut_loyer: data.total_montant_brut_loyer,
          total_montant_net_loyer: data.total_montant_net_loyer,
          declaration_option: data.declaration_option,
          taux_impot: data.taux_impot,
          retenue_source: data.retenue_source,
          montant_apres_impot: data.montant_apres_impot,
          montant_caution: data.montant_caution,
          duree_caution: data.duree_caution,
          statut_caution: data.statut_caution,
          montant_avance: data.montant_avance,
          duree_avance: data.duree_avance,
          n_engagement_depense: data.n_engagement_depense,
          echeance_revision_loyer: data.echeance_revision_loyer,
          // type_lieu: data.type_lieu,
          lieu: data.lieu,
          etat_contrat: etatContrat,
          piece_joint_contrat: piece_joint_contrat,
          contrats_suspendu: contrats_suspendu,
          contrat_avener: contrat_avener,
          nombre_part: data.nombre_part,
        };
        // return ContratHelper.createContratAV(req, res, data, `${numeroContrat}/AV`, piece_joint_contrat)
      }
    } else {
      updateContrat = {
        date_debut_loyer: data.date_debut_loyer,
        date_fin_contrat: data.date_fin_contrat,
        date_reprise_caution: data.date_reprise_caution,
        date_fin_avance: data.date_fin_avance,
        date_premier_paiement: data.date_premier_paiement,
        montant_loyer: isMotifMontantLoyer
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
        // type_lieu: data.type_lieu,
        lieu: data.lieu,
        etat_contrat: etatContrat,
        piece_joint_contrat: piece_joint_contrat,
        contrats_suspendu: contrats_suspendu,
        contrat_avener: contrat_avener,
        date_comptabilisation: nextDateComptabilisation,
        nombre_part: data.nombre_part,
      };
    }

    // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Proprietaire :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    // Recalculate ( Proprietaire ) montant & taxes if ( Montant loyer changed )
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

    if (data.etat_contrat.libelle === "Résilié") {
      // Make the lieu that attached to this foncier (transféré)
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

      // Recalculate ( Proprietaire ) taxes if contrat ( Résilié )
      // let newDureeLocation;
      // let dateDebutLoyer = new Date(data.date_debut_loyer);
      // let dateResiliation = new Date(data.etat_contrat.etat.date_resiliation);
      // let TauxImpot;
      // let RetenueSource;
      // let taxPeriodicite;
      // let newMontantLoyerProp;

      // // Calcul duree location
      // newDureeLocation =
      //   (dateResiliation.getFullYear() - dateDebutLoyer.getFullYear()) * 12;
      // newDureeLocation -= dateDebutLoyer.getMonth();
      // newDureeLocation += dateResiliation.getMonth();

      // await Contrat.find({ _id: req.params.Id, deleted: false })
      //   .populate({ path: "foncier", populate: { path: "proprietaire" } })
      //   .then(async (data_) => {
      //     data_[0].foncier.proprietaire.forEach(async (proprietaire) => {
      //       // Calcul Montant de loyer proprietaire
      //       newMontantLoyerProp =
      //         (proprietaire.pourcentage * data.montant_loyer) / 100;

      //       // Calcul taux d'impôt
      //       let Result = newMontantLoyerProp * newDureeLocation;
      //       // console.log("Result", Result);
      //       if (Result <= 30000) {
      //         TauxImpot = 0;
      //       } else {
      //         if (Result > 30000 && Result <= 120000) {
      //           TauxImpot = 0.1;
      //         } else {
      //           if (Result > 120000) {
      //             TauxImpot = 0.15;
      //           }
      //         }
      //       }

      //       // Calcul retenue à la source
      //       RetenueSource = newMontantLoyerProp * TauxImpot * newDureeLocation;

      //       // Calcul taxPeriodicite
      //       if (data.periodicite_paiement == "mensuelle") {
      //         taxPeriodicite = RetenueSource / newDureeLocation;
      //       } else {
      //         if (data.periodicite_paiement == "trimestrielle") {
      //           taxPeriodicite = RetenueSource / (newDureeLocation * 3);
      //         } else taxPeriodicite = 0;
      //       }

      //       // Calcul Montant apres impot
      //       montantApresImpot =
      //         newMontantLoyerProp - RetenueSource / newDureeLocation;

      //       // Update the proprietaire
      //       await Proprietaire.findByIdAndUpdate(proprietaire._id, {
      //         taux_impot: TauxImpot,
      //         retenue_source: RetenueSource,
      //         montant_apres_impot: montantApresImpot,
      //         montant_loyer: newMontantLoyerProp,
      //         tax_par_periodicite: taxPeriodicite,
      //       }).catch((error) => {
      //         res.status(422).send({
      //           message: error.message,
      //         });
      //       });

      //       await Proprietaire.find({ _id: proprietaire._id })
      //         .then((data__) => {
      //           console.log(data__);
      //         })
      //         .catch((error) => {
      //           res.status(422).send({
      //             message: error.message,
      //           });
      //         });
      //     });
      //   })
      //   .catch((error) => {
      //     res.status(422).send({
      //       message: error.message,
      //     });
      //   });
    }

    // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Mails :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    // Sending mail to All the DC (Département Comptable) roles
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
          // return res.json(contrat);
          // console.log(contrat);
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
              // console.log(emailsList.join());
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
            // console.log(`${DAJCemailsList.join()}`);
            mail.sendMail(
              `${DAJCemailsList.join()}`,
              "Contrat à valider",
              "validation1",
              DAJCmailData
            );
          }

          // Sending mail to CDGSP (V1)
          //   await User.aggregate([
          //     {
          //       $match: {
          //         deleted: false,
          //         userRoles: {
          //           $elemMatch: {
          //             roleCode: "CDGSP",
          //             deleted: false,
          //           },
          //         },
          //       },
          //     },
          //   ])
          //     .then((data_) => {
          //       for (let i = 0; i < data_.length; i++) {
          //         CDGSPemailsList.push(data_[i].email);
          //       }
          //       // console.log(emailsList.join());
          //     })
          //     .catch((error) => {
          //       console.log(error);
          //       res.status(400).send({ message: error.message });
          //     });

          //   let CDGSPmailData = {
          //     message:
          //           "Le contrat n°" +
          //           contrat.numero_contrat +
          //           " du " +
          //           contrat.foncier.type_lieu +
          //           " est soumis à la validation."
          //   };

          //   if (CDGSPemailsList.length > 0) {
          //     mail.sendMail(
          //       `${CDGSPemailsList.join()}`,
          //       "Contrat validation",
          //       "validation1",
          //       CDGSPmailData
          //     );
          //   }
          // });
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
              // dateDeffetAV.setDate(0);

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
              // dateFinOldContrat = dateDeffetAV.toISOString().slice(0, 10);

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
                  libelle: "Actif",
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
        populate: {
          path: "proprietaire",
          populate: {
            path: "proprietaire_list",
            match: { statut: { $in: ["Actif", "À ajouter"] } },
          },
          match: { statut: { $in: ["Actif", "À ajouter"] } },
        },
      })
      .then(async (data) => {
        // return res.json(data);
        console.log(data);
        let partGlobal = data.nombre_part;
        let partProprietaireGlobal = 0;
        // If some one is / has not a mandataire this variable will be true
        let hasnt_mandataire = false;
        data.foncier.proprietaire.forEach((proprietaire) => {
          if (!proprietaire.deleted && proprietaire != "À supprimer") {
            partProprietaireGlobal += proprietaire.part_proprietaire;
            if (!proprietaire.has_mandataire && !proprietaire.is_mandataire) {
              hasnt_mandataire = true;
            }
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
              // console.log(error);
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
          console.log({
            partGlobal: partGlobal,
            partProp: partProprietaireGlobal,
            hasnt_mandataire: hasnt_mandataire,
          });
        } else {
          console.log({
            partGlobal: partGlobal,
            partProp: partProprietaireGlobal,
            hasnt_mandataire: hasnt_mandataire,
          });
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
