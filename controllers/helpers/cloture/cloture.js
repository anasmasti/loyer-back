const Contrat = require("../../../models/contrat/contrat.model");
const ContratHelper = require("../contrat");
const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");

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
    periodicite,
    updatedAt,
    caution_versee,
    avance_versee
  ) => {
    // console.log(numero_contrat, proprietaire);
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
      updatedAt: updatedAt,
      caution_versee: caution_versee,
      avance_versee: avance_versee,
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
    montant_tax,
    updatedAt
  ) => {
    console.log(numero_contrat, proprietaire);
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
      numero_compte_bancaire: proprietaire.proprietaire.n_compte_bancaire,
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
      updatedAt: updatedAt ? updatedAt : "",
    };
    return orderVirement;
  },

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

  checkDtFinContratsSus: async (req, res) => {
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
                await Contrat.findByIdAndUpdate(
                  { _id: contrat._id },
                  { "etat_contrat.libelle": "Actif" }
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
};
