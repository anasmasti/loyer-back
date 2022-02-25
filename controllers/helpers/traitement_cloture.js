// const ContratSchema = require("../../../models/ContratContrat.model");
// const ordreVirementArchive = require("../../../models/archive/archiveVirement.schema");
// const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");
const clotureHelper = require("./cloture");

module.exports = {
  traitementClotureResilie: async (
    req,
    res,
    Contrat,
    dateGenerationDeComptabilisation,
    periodicite,
    ContratSchema
  ) => {
    let comptabilisationLoyerCrediter = [],
      montantDebiter = 0,
      comptabilisationLoyerDebiter = [],
      ordreVirement = [];

    let dateDebutLoyer = new Date(Contrat.date_debut_loyer);
    let dateDeComptabilisation = new Date(Contrat.date_comptabilisation);

    let montant_loyer_net,
      montant_loyer_brut,
      montant_tax = 0;
    let montant_loyer_net_mandataire,
      montant_loyer_brut_mandataire,
      montant_tax_mandataire = 0;
    let montant_a_verse = 0;

    if (
      req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
      req.body.annee == dateDeComptabilisation.getFullYear() &&
      dateDeComptabilisation <= Contrat.etat_contrat.etat.date_resiliation
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.foncier.proprietaire.length; j++) {
            if (Contrat.foncier.proprietaire[j].is_mandataire == true) {
              montant_loyer_net_mandataire =
                Contrat.foncier.proprietaire[j].montant_apres_impot;

              montant_loyer_brut_mandataire =
                Contrat.foncier.proprietaire[j].montant_loyer;

              montant_tax_mandataire =
                Contrat.foncier.proprietaire[j].tax_par_periodicite;

              montant_a_verse = montant_loyer_net_mandataire;
              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.foncier.proprietaire[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  dateDebutLoyer,
                  0
                )
              );
              if (
                Contrat.foncier.proprietaire[j].proprietaire_list.length !== 0
              ) {
                for (
                  let k = 0;
                  k < Contrat.foncier.proprietaire[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_net =
                    +montant_loyer_net_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_apres_impot;

                  montant_loyer_brut =
                    +montant_loyer_brut_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_loyer;

                  montant_tax =
                    +montant_tax_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .tax_par_periodicite;

                  montant_a_verse = +montant_loyer_net;

                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.foncier.proprietaire[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      dateDebutLoyer,
                      0
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
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
                  Contrat.foncier.proprietaire[j],
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse
                )
              );
            }
          }
        }
      }
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
    ContratSchema
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
      montant_tax = 0;
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
          for (let j = 0; j < Contrat.foncier.proprietaire.length; j++) {
            if (Contrat.foncier.proprietaire[j].is_mandataire == true) {
              //   montant_loyer_net_mandataire =
              //     Contrat.foncier.proprietaire[j].montant_avance_proprietaire -
              //     Contrat.foncier.proprietaire[j].tax_avance_proprietaire +
              //     Contrat.foncier.proprietaire[j].caution_par_proprietaire +
              //     Contrat.foncier.proprietaire[j].montant_apres_impot;

              montant_loyer_net_mandataire =
                Contrat.foncier.proprietaire[j].montant_avance_proprietaire -
                Contrat.foncier.proprietaire[j].tax_avance_proprietaire +
                Contrat.foncier.proprietaire[j].caution_par_proprietaire +
                Contrat.foncier.proprietaire[j].montant_apres_impot;

              montant_loyer_brut_mandataire =
                Contrat.foncier.proprietaire[j].montant_avance_proprietaire +
                Contrat.foncier.proprietaire[j].caution_par_proprietaire +
                Contrat.foncier.proprietaire[j].montant_loyer;

              montant_tax_mandataire =
                Contrat.foncier.proprietaire[j].tax_avance_proprietaire +
                Contrat.foncier.proprietaire[j].tax_par_periodicite;

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.foncier.proprietaire[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  dateDebutLoyer,
                  Contrat.foncier.proprietaire[j].caution_par_proprietaire
                )
              );
              if (
                Contrat.foncier.proprietaire[j].proprietaire_list.length != 0
              ) {
                for (
                  let k = 0;
                  k < Contrat.foncier.proprietaire[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_net =
                    +montant_loyer_net_mandataire +
                    (Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_avance_proprietaire -
                      Contrat.foncier.proprietaire[j].proprietaire_list[k]
                        .tax_avance_proprietaire) +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .caution_par_proprietaire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_apres_impot;

                  montant_loyer_brut =
                    +montant_loyer_brut_mandataire +
                    (Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_avance_proprietaire +
                      Contrat.foncier.proprietaire[j].proprietaire_list[k]
                        .caution_par_proprietaire +
                      Contrat.foncier.proprietaire[j].proprietaire_list[k]
                        .montant_loyer);

                  montant_tax =
                    +montant_tax_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .tax_avance_proprietaire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .tax_par_periodicite;

                  montant_a_verse = +montant_loyer_net;

                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.foncier.proprietaire[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      dateDebutLoyer,
                      Contrat.foncier.proprietaire[j].proprietaire_list[k]
                        .caution_par_proprietaire
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
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
                  Contrat.foncier.proprietaire[j],
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse
                )
              );
            }
          }
        }
      }
      console.log(comptabilisationLoyerCrediter);
      // await ContratSchema.findByIdAndUpdate(
      //   { _id: Contrat._id },
      //   {
      //     date_comptabilisation: null,
      //     caution_versee: true,
      //     avance_versee: true,
      //   }
      // );
    } //end if

    if (
      Contrat.montant_avance == 0 &&
      req.body.mois == dateDebutLoyer.getMonth() + 1 &&
      req.body.annee == dateDebutLoyer.getFullYear()
    ) {
      console.log("2->", true);
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.foncier.proprietaire.length; j++) {
            if (Contrat.foncier.proprietaire[j].is_mandataire == true) {
              montant_loyer_net_mandataire =
                Contrat.foncier.proprietaire[j].caution_par_proprietaire +
                Contrat.foncier.proprietaire[j].montant_apres_impot;

              montant_loyer_brut_mandataire =
                Contrat.foncier.proprietaire[j].caution_par_proprietaire +
                Contrat.foncier.proprietaire[j].montant_loyer;

              montant_tax_mandataire =
                Contrat.foncier.proprietaire[j].tax_par_periodicite;

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.foncier.proprietaire[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  dateDebutLoyer,
                  Contrat.foncier.proprietaire[j].caution_par_proprietaire
                )
              );

              if (
                Contrat.foncier.proprietaire[j].proprietaire_list.length !== 0
              ) {
                for (
                  let k = 0;
                  k < Contrat.foncier.proprietaire[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_net =
                    +montant_loyer_net_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .caution_par_proprietaire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_apres_impot;

                  montant_loyer_brut =
                    +montant_loyer_brut_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .caution_par_proprietaire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_loyer;

                  montant_tax =
                    +montant_tax_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .tax_par_periodicite;

                  montant_a_verse = +montant_loyer_net;

                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.foncier.proprietaire[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      dateDebutLoyer,
                      Contrat.foncier.proprietaire[j].proprietaire_list[k]
                        .caution_par_proprietaire
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
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
                  Contrat.foncier.proprietaire[j],
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse
                )
              );
            }
          }
        }
      }
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
          res.status(402).send({ message1: error.message });
        });
    }

    if (
      req.body.mois == premierDateDePaiement.getMonth() + 1 &&
      req.body.annee == premierDateDePaiement.getFullYear()
    ) {
      console.log("3->", true);
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.foncier.proprietaire.length; j++) {
            if (Contrat.foncier.proprietaire[j].is_mandataire == true) {
              montant_loyer_net_mandataire =
                Contrat.foncier.proprietaire[j].montant_apres_impot;

              montant_loyer_brut_mandataire =
                Contrat.foncier.proprietaire[j].montant_loyer;

              montant_tax_mandataire =
                Contrat.foncier.proprietaire[j].tax_par_periodicite;

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.foncier.proprietaire[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  dateDebutLoyer,
                  0
                )
              );

              if (
                Contrat.foncier.proprietaire[j].proprietaire_list.length !== 0
              ) {
                for (
                  let k = 0;
                  k < Contrat.foncier.proprietaire[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_net =
                    +montant_loyer_net_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_apres_impot;

                  montant_loyer_brut =
                    +montant_loyer_brut_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_loyer;

                  montant_tax =
                    +montant_tax_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .tax_par_periodicite;

                  montant_a_verse = +montant_loyer_net;

                  comptabilisationLoyerCrediter.push({
                    nom_de_piece: dateGenerationDeComptabilisation,
                    date_gl: dateGenerationDeComptabilisation,
                    date_operation: dateGenerationDeComptabilisation,
                    cin: Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .cin,
                    passport:
                      Contrat.foncier.proprietaire[j].proprietaire_list[k]
                        .passport,
                    carte_sejour:
                      Contrat.foncier.proprietaire[j].proprietaire_list[k]
                        .carte_sejour,
                    type: "LOY",
                    adresse_proprietaire:
                      Contrat.foncier.proprietaire[j].proprietaire_list[k]
                        .adresse,
                    adresse_lieu: Contrat.foncier.adresse,
                    origine: "PAISOFT",
                    devises: "MAD",
                    intitule_lieu: Contrat.foncier.lieu[g].lieu.intitule_lieu,
                    code_lieu: Contrat.foncier.lieu[g].lieu.code_lieu,
                    etablissement: "01",
                    centre_de_cout: "NS",
                    direction_regional:
                      Contrat.foncier.lieu[g].lieu.type_lieu ==
                      "Direction régionale"
                        ? Contrat.foncier.lieu[g].lieu.code_lieu
                        : Contrat.foncier.lieu[g].lieu.code_rattache_DR,
                    point_de_vente:
                      Contrat.foncier.lieu[g].lieu.type_lieu == "Point de vente"
                        ? Contrat.foncier.lieu[g].lieu.code_lieu
                        : "",
                    montant_net: montant_loyer_net,
                    montant_tax: montant_tax,
                    montant_caution: 0,
                    montant_brut: montant_loyer_brut,
                    date_comptabilisation: dateDebutLoyer,
                  });
                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.foncier.proprietaire[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      dateDebutLoyer,
                      0
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
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
                  Contrat.foncier.proprietaire[j],
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse
                )
              );
            }
          }
        }
      }
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

    if (
      req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
      req.body.annee == dateDeComptabilisation.getFullYear() &&
      req.body.mois <= dateFinDeContrat.getMonth() + 1 &&
      req.body.annee <= dateFinDeContrat.getFullYear()
    ) {
      console.log("4->", true);
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.foncier.proprietaire.length; j++) {
            if (Contrat.foncier.proprietaire[j].is_mandataire == true) {
              montant_loyer_net_mandataire =
                Contrat.foncier.proprietaire[j].montant_apres_impot;

              montant_loyer_brut_mandataire =
                Contrat.foncier.proprietaire[j].montant_loyer;

              montant_tax_mandataire =
                Contrat.foncier.proprietaire[j].tax_par_periodicite;

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                clotureHelper.createComptLoyerCredObject(
                  Contrat.foncier,
                  Contrat.foncier.proprietaire[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  dateDebutLoyer,
                  0
                )
              );

              if (
                Contrat.foncier.proprietaire[j].proprietaire_list.length !== 0
              ) {
                for (
                  let k = 0;
                  k < Contrat.foncier.proprietaire[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_net =
                    +montant_loyer_net_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_apres_impot;

                  montant_loyer_brut =
                    +montant_loyer_brut_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .montant_loyer;

                  montant_tax =
                    +montant_tax_mandataire +
                    Contrat.foncier.proprietaire[j].proprietaire_list[k]
                      .tax_par_periodicite;

                  montant_a_verse = +montant_loyer_net;

                  comptabilisationLoyerCrediter.push(
                    clotureHelper.createComptLoyerCredObject(
                      Contrat.foncier,
                      Contrat.foncier.proprietaire[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      dateDebutLoyer,
                      0
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
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
                  Contrat.foncier.proprietaire[j],
                  req.body.mois,
                  req.body.annee,
                  montant_a_verse
                )
              );
            }
          }
        }
      }
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
          res.status(402).send({ message3: error.message });
        });
    }

    return {
      ordre_virement: ordreVirement,
      cmptLoyerCrdt: comptabilisationLoyerCrediter,
      cmptLoyerDebt: comptabilisationLoyerDebiter,
    };
  },
};
