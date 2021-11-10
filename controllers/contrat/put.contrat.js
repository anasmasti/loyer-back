const Contrat = require("../../models/contrat/contrat.model");
const User = require("../../models/roles/roles.model");
const mail = require("../../helpers/mail.send");


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
      nextDateComptabilisation = null;

      // console.log(req.body.data);
    let data = JSON.parse(req.body.data);
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

      // let dureeSuspension = data.etat_contrat.etat.duree_suspension;
      // let dateComptabilisation = new Date(data.date_comptabilisation) 
      // nextDateComptabilisation = dateComptabilisation.setMonth(dateComptabilisation.getMonth() + dureeSuspension)

    } else if (data.etat_contrat.libelle === "Résilié") {
      etatContrat = {
        libelle: data.etat_contrat.libelle,
        etat: {
          intitule_lieu: data.etat_contrat.etat.intitule_lieu,
          reprise_caution: data.etat_contrat.etat.reprise_caution,
          date_resiliation: data.etat_contrat.etat.date_resiliation,
          etat_lieu_sortie: data.etat_contrat.etat.etat_lieu_sortie,
          preavis: data.etat_contrat.etat.preavis,
          images_etat_res_lieu_sortie: images_etat_res_lieu_sortie,
          lettre_res_piece_jointe: lettre_res_piece_jointe,
        },
      };
     
        let dateResiliation = new Date(data.etat_contrat.etat.date_resiliation)
        let setDateDebutDePreavis = new Date(dateResiliation.setMonth(dateResiliation.getMonth() - data.effort_caution)) 
       
        nextDateComptabilisation = setDateDebutDePreavis.setMonth(setDateDebutDePreavis.getMonth() +1)

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
          numero_contrat: numeroContrat + "AV",
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
          effort_caution: data.effort_caution,
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
        effort_caution: data.effort_caution,
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
        date_comptabilisation: nextDateComptabilisation
      };
    }

    // Sending mail to All the DC (Département Comptable) roles
    let mailData= {
      name: 'Yassine'
    }

    let emailsList = [];

    await User.aggregate([
      {
        $match: {
          deleted: false,
          userRoles: {
            $elemMatch: {
              roleCode: 'DC',
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
        console.log(emailsList.join());
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send({ message: error.message });
      });
      
    // mail.sendMail(
    //   emailsList.join(),
    //   "Contrat validation",
    //   "validation1",
    //   mailData
    // );

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
        console.log(emailsList.join());
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send({ message: error.message });
      });

    let mailData = {
      name: "Anas",
    };

    // mail.sendMail(
    //   emailsList.join(),
    //   "Contrat validation",
    //   "validation1",
    //   data
    // );

    // Sending mail to All the DAJC (Direction Affaires Juridiques et Conformité) roles
    Test('DAJC')

    await Contrat.findByIdAndUpdate(req.params.Id, { validation1_DMG: true });
  },

  modifierValidationDAJC: async (req, res) => {
    await Contrat.findByIdAndUpdate(req.params.Id, { validation2_DAJC: true });
  },

};
