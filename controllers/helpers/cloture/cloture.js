const Contrat = require("../../../models/contrat/contrat.model");
const Calcule = require("../calculProprietaire");
const ContratHelper = require("../contrat");
const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");
const Proprietaire = require("../../../models/proprietaire/proprietaire.model");
const Foncier = require("../../../models/foncier/foncier.model");
const mongoose = require("mongoose");

module.exports = {
  createComptLoyerCredObject: (
    foncier,
    proprietaire,
    lieu,
    dateGenerationDeComptabilisation,
    montant_loyer_net,
    montant_tax,
    montant_brut,
    montant_brut_loyer,
    dateDebutLoyer,
    montant_caution,
    numero_contrat,
    periodicite
  ) => {
    // console.log(lieu);
    let comptabilisationLoyerCrediter = {
      nom_de_piece: dateGenerationDeComptabilisation,
      nom_prenom: proprietaire.proprietaire.nom_prenom
        ? proprietaire.proprietaire.nom_prenom
        : proprietaire.proprietaire.raison_social,
      date_gl: dateGenerationDeComptabilisation,
      date_operation: dateGenerationDeComptabilisation,
      cin: proprietaire.proprietaire.cin
        ? proprietaire.proprietaire.cin
        : proprietaire.proprietaire.n_registre_commerce,
      passport: proprietaire.proprietaire.passport,
      carte_sejour: proprietaire.proprietaire.carte_sejour,
      type: "LOY",
      adresse_proprietaire: proprietaire.proprietaire.adresse,
      adresse_lieu: foncier.adresse,
      origine: "PAISOFT",
      devises: "MAD",
      intitule_lieu: lieu.lieu.intitule_lieu ? lieu.lieu.intitule_lieu : " ",
      type_lieu: lieu.lieu.type_lieu,
      code_lieu: lieu.lieu.code_lieu,
      etablissement: "01",
      centre_de_cout: "NS",
      direction_regional:
        lieu.lieu.type_lieu == "Direction régionale"
          ? lieu.lieu.code_lieu
          : lieu.lieu.type_lieu == "Siège"
          ? null
          : lieu.lieu.attached_DR.code_lieu || null,
      point_de_vente:
        lieu.lieu.type_lieu == "Point de vente" ? lieu.lieu.code_lieu : "",
      numero_contrat: numero_contrat,
      periodicite: periodicite,
      montant_net: montant_loyer_net,
      montant_tax: montant_tax,
      montant_caution: montant_caution,
      montant_brut: montant_brut,
      montant_brut_loyer: montant_brut_loyer,
      taux_impot: proprietaire.taux_impot,
      caution_proprietaire: proprietaire.caution_par_proprietaire,
      tax_avance_proprietaire: proprietaire.tax_avance_proprietaire,
      tax_loyer: proprietaire.tax_par_periodicite,
      montant_loyer: proprietaire.montant_loyer,
      montant_avance_proprietaire: proprietaire.montant_avance_proprietaire,
      retenue_source: proprietaire.retenue_source,
      date_comptabilisation: dateDebutLoyer,
      declaration_option: proprietaire.declaration_option,
    };
    return comptabilisationLoyerCrediter;
  },

  createComptLoyerDebiteObject: (
    lieu,
    montant_caution,
    numero_contrat,
    montantDebiter
  ) => {
    let comptabilisationLoyerDebite = {
      intitule_lieu: lieu.lieu.intitule_lieu ? lieu.lieu.intitule_lieu : " ",
      montant_caution: montant_caution,
      numero_contrat: numero_contrat,
      direction_regional:
        lieu.lieu.type_lieu == "Direction régionale"
          ? lieu.lieu.code_lieu
          : lieu.lieu.type_lieu == "Siège"
          ? null
          : lieu.lieu.attached_DR.code_lieu || null,
      point_de_vente:
        lieu.lieu.type_lieu == "Point de vente" ? lieu.lieu.code_lieu : "",
      montant: montantDebiter,
    };
    return comptabilisationLoyerDebite;
  },

  createOrderVirementObject: (
    lieu,
    proprietaire,
    numero_contrat,
    periodicite,
    mois,
    annee,
    montant_a_verse,
    montant_loyer_brut,
    montant_tax
  ) => {
    let orderVirement = {
      type_enregistrement: "0602",
      cin: proprietaire.proprietaire.cin
        ? proprietaire.proprietaire.cin
        : proprietaire.proprietaire.n_registre_commerce,
      passport: proprietaire.proprietaire.passport,
      carte_sejour: proprietaire.proprietaire.carte_sejour,
      nom_prenom: proprietaire.proprietaire.nom_prenom
        ? proprietaire.proprietaire.nom_prenom
        : proprietaire.proprietaire.raison_social,
      numero_compte_bancaire: proprietaire.n_compte_bancaire,
      mois: mois,
      annee: annee,
      nom_agence_bancaire: proprietaire.proprietaire.nom_agence_bancaire,
      banque: proprietaire.proprietaire.banque,
      intitule_lieu: lieu.lieu.intitule_lieu ? lieu.lieu.intitule_lieu : " ",
      type_lieu: lieu.lieu.type_lieu,
      numero_contrat: numero_contrat,
      periodicite: periodicite,
      montant_net: montant_a_verse,
      montant_brut: montant_loyer_brut,
      montant_taxe: montant_tax,
    };
    return orderVirement;
  },

  checkContratsAv: async (req, res) => {
    await Contrat.findOne({ "etat_contrat.libelle": "Test", deleted: false })
      .populate({ path: "old_contrat.contrat" })
      .populate({ path: "foncier", populate: { path: "proprietaire" } })
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

                  // Delete proprietaires
                  if (
                    contratAV.etat_contrat.etat.deleted_proprietaires.length > 0
                  ) {
                    contratAV.etat_contrat.etat.deleted_proprietaires.forEach(
                      (proprietaire) => {
                        ContratHelper.deleteProprietaire(
                          req,
                          res,
                          proprietaire
                        );
                      }
                    );
                  }

                  // Recalculate ( Proprietaire ) montant & taxes if ( Montant loyer changed )
                  for (
                    let i = 0;
                    i < contratAV.foncier.proprietaire.length;
                    i++
                  ) {
                    let partProprietaire =
                      contratAV.foncier.proprietaire[i].part_proprietaire;
                    let idProprietaire = mongoose.Types.ObjectId(
                      contratAV.foncier.proprietaire[i]._id
                    );
                    let updatedContrat = contratAV;
                    let hasDeclarationOption =
                      contratAV.foncier.proprietaire[i].declaration_option;

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
                        console.log("Proprietaire updated");
                      })
                      .catch((error) => {
                        res.status(400).send({ message: error.message });
                      });
                  }

                  let foncierId = mongoose.Types.ObjectId(
                    contratAV.foncier._id
                  );
                  await Foncier.findById({
                    _id: foncierId,
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

  checkDtFinContratsSus: async (req, res) => {
    await Contrat.find({ deleted: false, "etat_contrat.libelle": "Suspendu" })
      .then(async (contrats) => {
        contrats.forEach(async (contrat) => {
          let susDate = new Date(contrat.etat_contrat.etat.date_fin_suspension);
          let susMonth = susDate.getMonth() + 1;
          let susYear = susDate.getFullYear();
          let currentDate = new Date();
          let currentMonth = currentDate.getMonth() + 1;
          let currentYear = currentDate.getFullYear();

          if (
            (susMonth == currentMonth && susYear == currentYear) ||
            (susMonth > currentMonth && susYear < currentYear) ||
            (susMonth < currentMonth && !(susYear > currentYear))
          ) {
            await Contrat.findByIdAndUpdate(
              { _id: contrat._id },
              { "etat_contrat.libelle": "Actif" }
            );
          }
        });
      })
      .catch((error) => {
        res
          .status(402)
          .send({
            message: `Aucun contrat suspendu trouvé : ${error.message}`,
          });
      });
  },
};
