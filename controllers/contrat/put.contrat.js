const Contrat = require("../../models/contrat/contrat.model");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const User = require("../../models/roles/roles.model");
const mail = require("../../helpers/mail.send");
const Calcule = require("../helpers/calculProprietaire");

// function Test(userRole) {
//   console.log('test');
//   // let emailsList = [];

//   // await User.aggregate([
//   //   {
//   //     $match: {
//   //       deleted: false,
//   //       userRoles: {
//   //         $elemMatch: {
//   //           roleCode: userRole,
//   //           deleted: false,
//   //         },
//   //       },
//   //     },
//   //   },
//   // ])
//   //   .then((data) => {
//   //     for (let i = 0; i < data.length; i++) {
//   //       emailsList.push(data[i].email);
//   //     }
//   //     console.log(emailsList.join());
//   //   })
//   //   .catch((error) => {
//   //     console.log(error);
//   //     res.status(400).send({ message: error.message });
//   //   });

//   // mail.sendMail(
//   //   emailsList.join(),
//   //   "Contrat validation",
//   //   "validation1",
//   //   mailData
//   // );
// }

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
      data = null;

    // console.log(req.body.data);
    try {
      data = JSON.parse(req.body.data);
      console.log(data);
    } catch (error) {
      res.status(422).send({ message: error.message });
    }
    //store files
    if (req.files) {
      if (req.files.piece_joint_contrat) {
        piece_joint_contrat.push({
          image: req.files.piece_joint_contrat[0].path,
        });
      }
      if (req.files.images_etat_res_lieu_sortie) {
        images_etat_res_lieu_sortie.push({
          image: req.files.images_etat_res_lieu_sortie[0].path,
        });
      }
      if (req.files.lettre_res_piece_jointe) {
        lettre_res_piece_jointe.push({
          image: req.files.lettre_res_piece_jointe[0].path,
        });
      }
      if (req.files.piece_jointe_avenant) {
        piece_jointe_avenant.push({
          image: req.files.piece_jointe_avenant[0].path,
        });
      }
    }
    //checking and store etats
    if (data.etat_contrat.libelle === "Avenant") {
      etatContrat = {
        libelle: data.etat_contrat.libelle,
        etat: {
          n_avenant: data.etat_contrat.etat.n_avenant,
          motif: data.etat_contrat.etat.motif,
          montant_nouveau_loyer: data.etat_contrat.etat.montant_nouveau_loyer,
          signaletique_successeur:
            data.etat_contrat.etat.signaletique_successeur,
          piece_jointe_avenant: piece_jointe_avenant,
        },
      };
    } else if (data.etat_contrat.libelle === "Suspendu") {
      etatContrat = {
        libelle: data.etat_contrat.libelle,
        etat: {
          intitule_lieu: data.etat_contrat.etat.intitule_lieu,
          date_suspension: data.etat_contrat.etat.date_suspension,
          duree_suspension: data.etat_contrat.etat.duree_suspension,
          motif_suspension: data.etat_contrat.etat.motif_suspension,
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
    }

    //search for requested contrat
    let existedContrat = await Contrat.findById(req.params.Id);

    // store the exited files
    if (existedContrat) {
      if (existedContrat.piece_joint_contrat) {
        for (item in existedContrat.piece_joint_contrat) {
          piece_joint_contrat.push({
            image: existedContrat.piece_joint_contrat[item].image,
          });
        }
      }
      if (existedContrat.etat_contrat.etat.images_etat_res_lieu_sortie) {
        for (item in existedContrat.etat_contrat.etat
          .images_etat_res_lieu_sortie) {
          images_etat_res_lieu_sortie.push({
            image:
              existedContrat.etat_contrat.etat.images_etat_res_lieu_sortie[item]
                .image,
          });
        }
      }
      if (existedContrat.etat_contrat.etat.lettre_res_piece_jointe) {
        for (item in existedContrat.etat_contrat.etat.lettre_res_piece_jointe) {
          lettre_res_piece_jointe.push({
            image:
              existedContrat.etat_contrat.etat.lettre_res_piece_jointe[item]
                .image,
          });
        }
      }
      if (existedContrat.etat_contrat.etat.piece_jointe_avenant) {
        for (item in existedContrat.etat_contrat.etat.piece_jointe_avenant) {
          piece_jointe_avenant.push({
            image:
              existedContrat.etat_contrat.etat.piece_jointe_avenant[item].image,
          });
        }
      }
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
        let numeroContrat = numContratData.replace("AV", "");
        updateContrat = {
          numero_contrat: numeroContrat + "/AV",
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
          type_lieu: data.type_lieu,
          lieu: data.lieu,
          etat_contrat: etatContrat,
          piece_joint_contrat: piece_joint_contrat,
          contrats_suspendu: contrats_suspendu,
          contrat_avener: contrat_avener,
        };
      }
    } else {
      updateContrat = {
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
        type_lieu: data.type_lieu,
        lieu: data.lieu,
        etat_contrat: etatContrat,
        piece_joint_contrat: piece_joint_contrat,
        contrats_suspendu: contrats_suspendu,
        contrat_avener: contrat_avener,
        date_comptabilisation: nextDateComptabilisation,
      };
    }

    // Sending mail to All the DC (Département Comptable) roles
    if (
      data.etat_contrat.libelle === "Résilié" ||
      data.etat_contrat.libelle === "Suspendu"
    ) {
      let mailData = {
        message:
          "Le contrat n°" +
          data.numero_contrat +
          " est " +
          data.etat_contrat.libelle +
          " .",
      };

      let emailsList = [];

      await User.aggregate([
        {
          $match: {
            deleted: false,
            userRoles: {
              $elemMatch: {
                roleCode: "DC",
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
          "Contrat validation",
          "validation1",
          mailData
        );
      }
    }

    // :::::::::::::::::::::::::::::::::::::::::::::::::::: Proprietaire ::::::::::::::::::::::::::::::::::::::::::::::::::::

    // Recalculate ( Proprietaire ) montant & taxes if ( Montant loyer changed )
    await Contrat.find({ _id: req.params.Id, deleted: false })
    .populate({ path: "foncier", populate: { path: "proprietaire" } })
    .then(async (data_) => {
      for (let i = 0; i < data_[0].foncier.proprietaire.length; i++) {
          let pourcentage = data_[0].foncier.proprietaire[i].pourcentage;
          let idProprietaire = data_[0].foncier.proprietaire[i]._id;
          let updatedContrat = data;

          let updatedProprietaire = Calcule(
            updatedContrat,
            pourcentage,
            idProprietaire
          );

          await Proprietaire.findByIdAndUpdate(
            idProprietaire,
            updatedProprietaire
            )
            .then((data) => {
              // res.json(data);
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

    // Recalculate ( Proprietaire ) taxes if contrat ( Résilié )
    if (data.etat_contrat.libelle === "Résilié") {
      let newDureeLocation;
      let dateDebutLoyer = new Date(data.date_debut_loyer);
      let dateResiliation = new Date(data.etat_contrat.etat.date_resiliation);
      let TauxImpot;
      let RetenueSource;
      let taxPeriodicite;
      let newMontantLoyerProp;

      // Calcul duree location
      newDureeLocation =
        (dateResiliation.getFullYear() - dateDebutLoyer.getFullYear()) * 12;
      newDureeLocation -= dateDebutLoyer.getMonth();
      newDureeLocation += dateResiliation.getMonth();

      await Contrat.find({ _id: req.params.Id, deleted: false })
        .populate({ path: "foncier", populate: { path: "proprietaire" } })
        .then(async (data_) => {
          data_[0].foncier.proprietaire.forEach(async (proprietaire) => {
            // Calcul Montant de loyer proprietaire
            newMontantLoyerProp =
              (proprietaire.pourcentage * data.montant_loyer) / 100;

            // Calcul taux d'impôt
            let Result = newMontantLoyerProp * newDureeLocation;
            // console.log("Result", Result);
            if (Result <= 30000) {
              TauxImpot = 0;
            } else {
              if (Result > 30000 && Result <= 120000) {
                TauxImpot = 0.1;
              } else {
                if (Result > 120000) {
                  TauxImpot = 0.15;
                }
              }
            }

            // Calcul retenue à la source
            RetenueSource = newMontantLoyerProp * TauxImpot * newDureeLocation;

            // Calcul taxPeriodicite
            if (data.periodicite_paiement == "mensuelle") {
              taxPeriodicite = RetenueSource / newDureeLocation;
            } else {
              if (data.periodicite_paiement == "trimestrielle") {
                taxPeriodicite = RetenueSource / (newDureeLocation * 3);
              } else taxPeriodicite = 0;
            }

            // Calcul Montant apres impot
            montantApresImpot =
              newMontantLoyerProp - RetenueSource / newDureeLocation;

            // Update the proprietaire
            await Proprietaire.findByIdAndUpdate(proprietaire._id, {
              taux_impot: TauxImpot,
              retenue_source: RetenueSource,
              montant_apres_impot: montantApresImpot,
              montant_loyer: newMontantLoyerProp,
              tax_par_periodicite: taxPeriodicite,
            }).catch((error) => {
              res.status(422).send({
                message: error.message,
              });
            });

            // await Proprietaire.find({ _id: proprietaire._id })
            //   .then((data__) => {
            //     console.log(data__);
            //   })
            //   .catch((error) => {
            //     res.status(422).send({
            //       message: error.message,
            //     });
            //   });
          });
        })
        .catch((error) => {
          res.status(422).send({
            message: error.message,
          });
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
    let emailsList = [];

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
      .then((data) => {
        for (let i = 0; i < data.length; i++) {
          emailsList.push(data[i].email);
        }
        // console.log(emailsList.join());
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send({ message: error.message });
      });

    let mailData = {
      message: "La première validation est effectuée.",
    };

    if (emailsList.length > 0) {
      mail.sendMail(
        `${emailsList.join()}`,
        "Contrat validation",
        "validation1",
        mailData
      );
    }

    // Sending mail to All the DAJC (Direction Affaires Juridiques et Conformité) roles
    await Contrat.findByIdAndUpdate(req.params.Id, { validation1_DMG: true });
  },

  modifierValidationDAJC: async (req, res) => {
    await Contrat.findByIdAndUpdate(req.params.Id, { validation2_DAJC: true });
  },
};
