const clotureHelper = require("./cloture");

module.exports = {
  traitementClotureResilie: async (
    req,
    res,
    Contrat,
    dateGenerationDeComptabilisation,
    periodicite,
    ContratSchema,
    Cloture
  ) => {
    let comptabilisationLoyerCrediter = [],
      montantDebiter = 0,
      comptabilisationLoyerDebiter = [],
      ordreVirement = [];

    let dateDebutLoyer = new Date(Contrat.date_debut_loyer);
    let dateDeComptabilisation = new Date(Contrat.date_comptabilisation);

    let montant_loyer_net,
      montant_loyer_brut,
      montant_tax = 0,
      montant_loyer_brut_loyer;
    let montant_loyer_net_mandataire,
      montant_loyer_brut_mandataire,
      montant_tax_mandataire = 0,
      montant_loyer_brut_taxes;
    let montant_a_verse = 0;

    for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
      if (Contrat.foncier.lieu[g].deleted == false) {
        for (let j = 0; j < Contrat.proprietaires.length; j++) {
          if (Contrat.proprietaires[j].is_mandataire == true) {
            montant_loyer_brut_loyer = Contrat.proprietaires[j].montant_loyer;

            montant_loyer_net_mandataire =
              Contrat.proprietaires[j].montant_apres_impot;

            montant_loyer_brut_mandataire =
              Contrat.proprietaires[j].montant_loyer;

            montant_tax_mandataire = Contrat.proprietaires[j].retenue_source;

            montant_a_verse = montant_loyer_net_mandataire;
            comptabilisationLoyerCrediter.push(
              clotureHelper.createComptLoyerCredObject(
                Contrat.foncier,
                Contrat.proprietaires[j],
                Contrat.foncier.lieu[g],
                dateGenerationDeComptabilisation,
                montant_loyer_net_mandataire,
                montant_tax_mandataire,
                montant_loyer_brut_mandataire,
                montant_loyer_brut_loyer,
                dateDebutLoyer,
                0,
                Contrat.numero_contrat,
                Contrat.periodicite_paiement,
                Contrat.updatedAt,
                Contrat.caution_versee,
                Contrat.avance_versee
              )
            );
            if (Contrat.proprietaires[j].proprietaire_list.length !== 0) {
              for (
                let k = 0;
                k < Contrat.proprietaires[j].proprietaire_list.length;
                k++
              ) {
                montant_loyer_brut_taxes =
                  Contrat.proprietaires[j].proprietaire_list[k].montant_loyer;

                montant_loyer_net =
                  Contrat.proprietaires[j].proprietaire_list[k]
                    .montant_apres_impot;

                montant_loyer_brut =
                  Contrat.proprietaires[j].proprietaire_list[k].montant_loyer;

                montant_tax =
                  Contrat.proprietaires[j].proprietaire_list[k].retenue_source;

                montant_a_verse += montant_loyer_net;
                montant_loyer_brut_mandataire += montant_loyer_brut;
                montant_tax_mandataire += montant_tax;

                comptabilisationLoyerCrediter.push(
                  clotureHelper.createComptLoyerCredObject(
                    Contrat.foncier,
                    Contrat.proprietaires[j].proprietaire_list[k],
                    Contrat.foncier.lieu[g],
                    dateGenerationDeComptabilisation,
                    montant_loyer_net,
                    montant_tax,
                    montant_loyer_brut,
                    dateDebutLoyer,
                    0,
                    Contrat.numero_contrat,
                    Contrat.periodicite_paiement,
                    Contrat.updatedAt,
                    Contrat.caution_versee,
                    Contrat.avance_versee
                  )
                );
                montant_loyer_net = 0;
                montant_loyer_brut = 0;
                montant_tax = 0;
                montant_loyer_brut_loyer = 0;
                montant_loyer_brut_taxes = 0;
              }
            }

            montantDebiter = Contrat.montant_loyer;

            comptabilisationLoyerDebiter.push(
              clotureHelper.createComptLoyerDebiteObject(
                Contrat.foncier.lieu[g],
                Contrat.montant_caution,
                Contrat.numero_Contrat,
                montantDebiter
              )
            );

            ordreVirement.push(
              clotureHelper.createOrderVirementObject(
                Contrat.foncier.lieu[g],
                Contrat.proprietaires[j],
                Contrat.numero_contrat,
                Contrat.periodicite_paiement,
                req.body.mois,
                req.body.annee,
                montant_a_verse,
                montant_loyer_brut_mandataire,
                montant_tax_mandataire,
                Contrat.updatedAt
              )
            );
          }
        }
      }
    }

    if (Cloture) {
      let nextDateComptabilisation;
      if (periodicite == 12) {
        nextDateComptabilisation = dateDeComptabilisation.setFullYear(
          dateDeComptabilisation.getFullYear() + 1
        );
      } else {
        nextDateComptabilisation = dateDeComptabilisation.setMonth(
          dateDeComptabilisation.getMonth() + 1
        );
      }
      await ContratSchema.findByIdAndUpdate(
        { _id: Contrat._id },
        { date_comptabilisation: nextDateComptabilisation }
      )
        .then(() => {
          console.log("Date Comptabilisation Changed !");
        })
        .catch((error) => {
          res.status(402).send({ message: error.message });
        });
    }

    return {
      ordre_virement: ordreVirement,
      cmptLoyerCrdt: comptabilisationLoyerCrediter,
      cmptLoyerDebt: comptabilisationLoyerDebiter,
    };
  },

  traitementClotureActif: async (
    req,
    res,
    Contrat,
    dateGenerationDeComptabilisation,
    periodicite,
    ContratSchema,
    Cloture
  ) => {
    let comptabilisationLoyerCrediter = [],
      montantDebiter = 0,
      comptabilisationLoyerDebiter = [],
      ordreVirement = [];

    let dateDebutLoyer = new Date(Contrat.date_debut_loyer);
    let premierDateDePaiement = new Date(Contrat.date_premier_paiement);
    let dateDeComptabilisation = new Date(Contrat.date_comptabilisation);
    let dateFinDeContrat = Contrat.date_fin_Contrat;

    let montant_loyer_net,
      montant_loyer_brut,
      montant_tax = 0,
      montant_loyer_brut_taxes,
      montant_loyer_brut_loyer;
    let montant_loyer_net_mandataire,
      montant_loyer_brut_mandataire,
      montant_tax_mandataire = 0;
    let montant_a_verse = 0;

    if (
      Contrat.montant_avance > 0 &&
      req.body.mois == dateDebutLoyer.getMonth() + 1 &&
      req.body.annee == dateDebutLoyer.getFullYear()
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.proprietaires.length; j++) {
            if (Contrat.proprietaires[j].is_mandataire == true) {
              montant_loyer_brut_loyer = 0;

              montant_loyer_brut_mandataire =
                Contrat.proprietaires[j].montant_avance_proprietaire +
                Contrat.proprietaires[j].caution_par_proprietaire;

              montant_tax_mandataire =
                Contrat.proprietaires[j].tax_avance_proprietaire;

              montant_loyer_net_mandataire =
                montant_loyer_brut_mandataire - montant_tax_mandataire;

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.proprietaires[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  montant_loyer_brut_loyer,
                  dateDebutLoyer,
                  Contrat.proprietaires[j].caution_par_proprietaire,
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  Contrat.updatedAt,
                  Contrat.caution_versee,
                  Contrat.avance_versee
                )
              );
              if (Contrat.proprietaires[j].proprietaire_list.length != 0) {
                for (
                  let k = 0;
                  k < Contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_brut =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .montant_avance_proprietaire +
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .caution_par_proprietaire;

                  // Montant brut sur loyer
                  montant_loyer_brut_taxes = 0;

                  montant_tax =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .tax_avance_proprietaire;

                  montant_loyer_net = montant_loyer_brut - montant_tax;

                  montant_a_verse += montant_loyer_net;

                  montant_tax_mandataire += montant_tax;

                  montant_loyer_brut_mandataire += montant_loyer_brut;

                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.proprietaires[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      montant_loyer_brut_taxes,
                      dateDebutLoyer,
                      Contrat.proprietaires[j].proprietaire_list[k]
                        .caution_par_proprietaire,
                      Contrat.numero_contrat,
                      Contrat.periodicite_paiement,
                      Contrat.updatedAt,
                      Contrat.caution_versee,
                      Contrat.avance_versee
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
                  montant_loyer_brut_loyer = 0;
                  montant_loyer_brut_taxes = 0;
                }
              }

              montantDebiter =
                Contrat.montant_loyer +
                Contrat.montant_avance +
                Contrat.montant_caution;

              comptabilisationLoyerDebiter.push(
                clotureHelper.createComptLoyerDebiteObject(
                  Contrat.foncier.lieu[g],
                  Contrat.montant_caution,
                  Contrat.numero_Contrat,
                  montantDebiter
                )
              );

              ordreVirement.push(
                clotureHelper.createOrderVirementObject(
                  Contrat.foncier.lieu[g],
                  Contrat.proprietaires[j],
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse,
                  montant_loyer_brut_mandataire,
                  montant_tax_mandataire,
                  Contrat.updatedAt
                )
              );
            }
          }
        }
      }
      if (Cloture) {
        await ContratSchema.findByIdAndUpdate(
          { _id: Contrat._id },
          {
            date_comptabilisation: null,
            caution_versee: true,
            avance_versee: true,
          }
        );
      }
    } //end if

    if (
      (Contrat.montant_avance == 0 || Contrat.montant_avance == null) &&
      req.body.mois == dateDebutLoyer.getMonth() + 1 &&
      req.body.annee == dateDebutLoyer.getFullYear()
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.proprietaires.length; j++) {
            if (Contrat.proprietaires[j].is_mandataire == true) {
              montant_loyer_brut_loyer = Contrat.proprietaires[j].montant_loyer;

              montant_loyer_brut_mandataire =
                Contrat.proprietaires[j].caution_par_proprietaire +
                Contrat.proprietaires[j].montant_loyer;

              montant_tax_mandataire = Contrat.proprietaires[j].retenue_source;

              montant_loyer_net_mandataire =
                Contrat.proprietaires[j].caution_par_proprietaire +
                Contrat.proprietaires[j].montant_apres_impot;

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.proprietaires[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  montant_loyer_brut_loyer,
                  dateDebutLoyer,
                  Contrat.proprietaires[j].caution_par_proprietaire,
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  Contrat.updatedAt,
                  Contrat.caution_versee,
                  Contrat.avance_versee
                )
              );

              if (Contrat.proprietaires[j].proprietaire_list.length !== 0) {
                for (
                  let k = 0;
                  k < Contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_brut_taxes =
                    Contrat.proprietaires[j].proprietaire_list[k].montant_loyer;

                  montant_loyer_brut =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .caution_par_proprietaire +
                    Contrat.proprietaires[j].proprietaire_list[k].montant_loyer;

                  montant_loyer_net =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .caution_par_proprietaire +
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .montant_apres_impot;

                  montant_tax =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .retenue_source;

                  montant_a_verse += montant_loyer_net;
                  montant_loyer_brut_mandataire += montant_loyer_brut;
                  montant_tax_mandataire += montant_tax;

                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.proprietaires[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      montant_loyer_brut_taxes,
                      dateDebutLoyer,
                      Contrat.proprietaires[j].proprietaire_list[k]
                        .caution_par_proprietaire,
                      Contrat.numero_contrat,
                      Contrat.periodicite_paiement,
                      Contrat.updatedAt,
                      Contrat.caution_versee,
                      Contrat.avance_versee
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
                  montant_loyer_brut_loyer = 0;
                  montant_loyer_brut_taxes = 0;
                }
              }

              montantDebiter = Contrat.montant_loyer + Contrat.montant_caution;

              comptabilisationLoyerDebiter.push(
                clotureHelper.createComptLoyerDebiteObject(
                  Contrat.foncier.lieu[g],
                  Contrat.montant_caution,
                  Contrat.numero_Contrat,
                  montantDebiter
                )
              );

              ordreVirement.push(
                clotureHelper.createOrderVirementObject(
                  Contrat.foncier.lieu[g],
                  Contrat.proprietaires[j],
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse,
                  montant_loyer_brut_mandataire,
                  montant_tax_mandataire,
                  Contrat.updatedAt
                )
              );
            }
          }
        }
      }
      if (Cloture) {
        let nextDateComptabilisation;
        if (periodicite == 12) {
          nextDateComptabilisation = dateDebutLoyer.setFullYear(
            dateDebutLoyer.getFullYear() + 1
          );
        } else {
          nextDateComptabilisation = dateDebutLoyer.setMonth(
            dateDebutLoyer.getMonth() + periodicite
          );
        }
        await ContratSchema.findByIdAndUpdate(
          { _id: Contrat._id },
          {
            date_comptabilisation: nextDateComptabilisation,
            caution_versee: true,
            avance_versee: true,
          }
        )
          .then(() => {
            console.log("Date Comptabilisation Changed !");
          })
          .catch((error) => {
            res.status(402).send({ message: error.message });
          });
      }
    }

    if (
      Contrat.montant_avance > 0 &&
      req.body.mois == premierDateDePaiement.getMonth() + 1 &&
      req.body.annee == premierDateDePaiement.getFullYear()
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.proprietaires.length; j++) {
            if (Contrat.proprietaires[j].is_mandataire == true) {
              montant_loyer_brut_loyer = Contrat.proprietaires[j].montant_loyer;

              montant_loyer_net_mandataire =
                Contrat.proprietaires[j].montant_apres_impot;

              montant_loyer_brut_mandataire =
                Contrat.proprietaires[j].montant_loyer;

              montant_tax_mandataire = Contrat.proprietaires[j].retenue_source;

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.proprietaires[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  montant_loyer_brut_loyer,
                  dateDebutLoyer,
                  0,
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  Contrat.updatedAt,
                  Contrat.caution_versee,
                  Contrat.avance_versee
                )
              );

              if (Contrat.proprietaires[j].proprietaire_list.length !== 0) {
                for (
                  let k = 0;
                  k < Contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_brut_taxes =
                    Contrat.proprietaires[j].proprietaire_list[k].montant_loyer;

                  montant_loyer_net =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .montant_apres_impot;

                  montant_loyer_brut =
                    Contrat.proprietaires[j].proprietaire_list[k].montant_loyer;

                  montant_tax =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .retenue_source;

                  montant_a_verse += montant_loyer_net;
                  montant_loyer_brut_mandataire += montant_loyer_brut;
                  montant_tax_mandataire += montant_tax;

                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.proprietaires[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      montant_loyer_brut_taxes,
                      dateDebutLoyer,
                      0,
                      Contrat.numero_contrat,
                      Contrat.periodicite_paiement,
                      Contrat.updatedAt,
                      Contrat.caution_versee,
                      Contrat.avance_versee
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
                  montant_loyer_brut_loyer = 0;
                  montant_loyer_brut_taxes = 0;
                }
              }

              montantDebiter = Contrat.montant_loyer;

              comptabilisationLoyerDebiter.push(
                clotureHelper.createComptLoyerDebiteObject(
                  Contrat.foncier.lieu[g],
                  Contrat.montant_caution,
                  Contrat.numero_Contrat,
                  montantDebiter
                )
              );

              ordreVirement.push(
                clotureHelper.createOrderVirementObject(
                  Contrat.foncier.lieu[g],
                  Contrat.proprietaires[j],
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse,
                  montant_loyer_brut_mandataire,
                  montant_tax_mandataire,
                  Contrat.updatedAt
                )
              );
            }
          }
        }
      }
      if (Cloture) {
        let nextDateComptabilisation;
        if (periodicite == 12) {
          nextDateComptabilisation = premierDateDePaiement.setFullYear(
            premierDateDePaiement.getFullYear() + 1
          );
        } else {
          nextDateComptabilisation = premierDateDePaiement.setMonth(
            premierDateDePaiement.getMonth() + periodicite
          );
        }
        await ContratSchema.findByIdAndUpdate(
          { _id: Contrat._id },
          {
            date_comptabilisation: nextDateComptabilisation,
          }
        )
          .then(() => {
            console.log("Date Comptabilisation Changed !");
          })
          .catch((error) => {
            res.status(402).send({ message2: error.message });
          });
      }
    }

    if (
      req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
      req.body.annee == dateDeComptabilisation.getFullYear()
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.proprietaires.length; j++) {
            if (Contrat.proprietaires[j].is_mandataire == true) {
              montant_loyer_brut_loyer = Contrat.proprietaires[j].montant_loyer;

              montant_loyer_net_mandataire =
                Contrat.proprietaires[j].montant_apres_impot;

              montant_loyer_brut_mandataire =
                Contrat.proprietaires[j].montant_loyer;

              montant_tax_mandataire = Contrat.proprietaires[j].retenue_source;

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.proprietaires[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  montant_loyer_brut_loyer,
                  dateDebutLoyer,
                  0,
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  Contrat.updatedAt,
                  Contrat.caution_versee,
                  Contrat.avance_versee
                )
              );

              if (Contrat.proprietaires[j].proprietaire_list.length !== 0) {
                for (
                  let k = 0;
                  k < Contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_brut_taxes =
                    Contrat.proprietaires[j].proprietaire_list[k].montant_loyer;

                  montant_loyer_net =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .montant_apres_impot;

                  montant_loyer_brut =
                    Contrat.proprietaires[j].proprietaire_list[k].montant_loyer;

                  montant_tax =
                    Contrat.proprietaires[j].proprietaire_list[k]
                      .retenue_source;

                  montant_a_verse += montant_loyer_net;
                  montant_loyer_brut_mandataire += montant_loyer_brut;
                  montant_tax_mandataire += montant_tax;

                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.proprietaires[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      montant_loyer_brut_taxes,
                      dateDebutLoyer,
                      0,
                      Contrat.numero_contrat,
                      Contrat.periodicite_paiement,
                      Contrat.updatedAt,
                      Contrat.caution_versee,
                      Contrat.avance_versee
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
                  montant_loyer_brut_loyer = 0;
                  montant_loyer_brut_taxes = 0;
                }
              }

              montantDebiter = Contrat.montant_loyer;

              comptabilisationLoyerDebiter.push(
                clotureHelper.createComptLoyerDebiteObject(
                  Contrat.foncier.lieu[g],
                  Contrat.montant_caution,
                  Contrat.numero_Contrat,
                  montantDebiter
                )
              );

              ordreVirement.push(
                clotureHelper.createOrderVirementObject(
                  Contrat.foncier.lieu[g],
                  Contrat.proprietaires[j],
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse,
                  montant_loyer_brut_mandataire,
                  montant_tax_mandataire,
                  Contrat.updatedAt
                )
              );
            }
          }
        }
      }
      if (Cloture) {
        let nextDateComptabilisation;
        if (periodicite == 12) {
          nextDateComptabilisation = dateDeComptabilisation.setFullYear(
            dateDeComptabilisation.getFullYear() + 1
          );
        } else {
          nextDateComptabilisation = dateDeComptabilisation.setMonth(
            dateDeComptabilisation.getMonth() + periodicite
          );
        }

        await ContratSchema.findByIdAndUpdate(
          { _id: Contrat._id },
          { date_comptabilisation: nextDateComptabilisation }
        )
          .then(() => {
            console.log("Date Comptabilisation Changed !");
          })
          .catch((error) => {
            res.status(402).send({ message: error.message });
          });
      }
    }

    return {
      ordre_virement: ordreVirement,
      cmptLoyerCrdt: comptabilisationLoyerCrediter,
      cmptLoyerDebt: comptabilisationLoyerDebiter,
    };
  },
};
