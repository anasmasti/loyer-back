const createObjectHelper = require("../shared/create_objects");
const clotureHelper = require("../shared/cloture_helper");
// import * as moment from "moment";
const moment = require("moment");

module.exports = {
  traitementClotureResilie: async (
    res,
    Contrat,
    dateGenerationDeComptabilisation,
    periodicite,
    ContratSchema,
    Cloture,
    treatmentMonth,
    treatmentAnnee
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
      montant_loyer_brut_taxes,
      montant_net_without_caution = 0;
    let montant_a_verse = 0;

    for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
      if (Contrat.foncier.lieu[g].deleted == false) {
        for (let j = 0; j < Contrat.proprietaires.length; j++) {
          if (Contrat.proprietaires[j].is_mandataire == true) {
            montant_loyer_brut_loyer =
              +Contrat.proprietaires[j].montant_loyer.toFixed(2);

            montant_tax_mandataire =
              +Contrat.proprietaires[j].retenue_source.toFixed(2);

            montant_loyer_net_mandataire =
              +montant_loyer_brut_loyer.toFixed(2) -
              +montant_tax_mandataire.toFixed(2);

            montant_loyer_brut_mandataire =
              +Contrat.proprietaires[j].montant_loyer.toFixed(2);

            montant_net_without_caution =
              +Contrat.proprietaires[j].montant_loyer.toFixed(2) -
              +Contrat.proprietaires[j].retenue_source.toFixed(2);

            montant_a_verse = +montant_loyer_net_mandataire.toFixed(2);
            comptabilisationLoyerCrediter.push(
              createObjectHelper.createComptLoyerCredObject(
                Contrat,
                Contrat.proprietaires[j],
                Contrat.foncier.lieu[g],
                dateGenerationDeComptabilisation,
                montant_loyer_net_mandataire,
                montant_tax_mandataire,
                montant_loyer_brut_mandataire,
                montant_loyer_brut_loyer,
                dateDebutLoyer,
                0,
                montant_net_without_caution,
                treatmentMonth,
                treatmentAnnee
              )
            );
            if (Contrat.proprietaires[j].proprietaire_list.length !== 0) {
              for (
                let k = 0;
                k < Contrat.proprietaires[j].proprietaire_list.length;
                k++
              ) {
                montant_loyer_brut_taxes =
                  +Contrat.proprietaires[j].proprietaire_list[
                    k
                  ].montant_loyer.toFixed(2);

                montant_loyer_net =
                  +Contrat.proprietaires[j].proprietaire_list[
                    k
                  ].montant_apres_impot.toFixed(2);

                montant_loyer_brut =
                  +Contrat.proprietaires[j].proprietaire_list[
                    k
                  ].montant_loyer.toFixed(2);

                montant_tax =
                  +Contrat.proprietaires[j].proprietaire_list[
                    k
                  ].retenue_source.toFixed(2);

                montant_net_without_caution =
                  +Contrat.proprietaires[j].proprietaire_list[
                    k
                  ].montant_loyer.toFixed(2) -
                  +Contrat.proprietaires[j].proprietaire_list[
                    k
                  ].retenue_source.toFixed(2);

                montant_a_verse += +montant_loyer_net.toFixed(2);
                montant_loyer_brut_mandataire += +montant_loyer_brut.toFixed(2);
                montant_tax_mandataire += +montant_tax.toFixed(2);

                comptabilisationLoyerCrediter.push(
                  createObjectHelper.createComptLoyerCredObject(
                    Contrat,
                    Contrat.proprietaires[j].proprietaire_list[k],
                    Contrat.foncier.lieu[g],
                    dateGenerationDeComptabilisation,
                    montant_loyer_net,
                    montant_tax,
                    montant_loyer_brut,
                    dateDebutLoyer,
                    0,
                    montant_net_without_caution,
                    treatmentMonth,
                    treatmentAnnee
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

            ordreVirement.push(
              createObjectHelper.createOrderVirementObject(
                Contrat.foncier.lieu[g],
                Contrat.proprietaires[j],
                Contrat.numero_contrat,
                Contrat.periodicite_paiement,
                treatmentMonth,
                treatmentAnnee,
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
    res,
    Contrat,
    dateGenerationDeComptabilisation,
    periodicite,
    ContratSchema,
    Cloture,
    treatmentMonth,
    treatmentAnnee,
    isOverdued = false,
    calculCaution = false
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
      montant_net_without_caution = 0,
      montant_tax = 0,
      montant_loyer_brut_taxes,
      montant_loyer_brut_loyer;
    let montant_loyer_net_mandataire,
      montant_loyer_brut_mandataire,
      montant_tax_mandataire = 0;
    let montant_a_verse = 0;

    if (
      Contrat.montant_avance > 0 &&
      treatmentMonth == dateDebutLoyer.getMonth() + 1 &&
      treatmentAnnee == dateDebutLoyer.getFullYear()
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.proprietaires.length; j++) {
            if (Contrat.proprietaires[j].is_mandataire == true) {
              montant_loyer_brut_loyer = 0;

              montant_loyer_brut_mandataire =
                +Contrat.proprietaires[j].montant_avance_proprietaire.toFixed(
                  2
                ) +
                +Contrat.proprietaires[j].caution_par_proprietaire.toFixed(2);

              montant_tax_mandataire =
                +Contrat.proprietaires[j].tax_avance_proprietaire.toFixed(2);

              montant_loyer_net_mandataire =
                montant_loyer_brut_mandataire - montant_tax_mandataire;

              montant_net_without_caution =
                +Contrat.proprietaires[j].montant_avance_proprietaire.toFixed(
                  2
                ) -
                +Contrat.proprietaires[j].tax_avance_proprietaire.toFixed(2);

              montant_a_verse = montant_loyer_net_mandataire;

              comptabilisationLoyerCrediter.push(
                createObjectHelper.createComptLoyerCredObject(
                  Contrat,
                  Contrat.proprietaires[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  montant_loyer_brut_loyer,
                  dateDebutLoyer,
                  Contrat.proprietaires[j].caution_par_proprietaire,
                  montant_net_without_caution,
                  treatmentMonth,
                  treatmentAnnee
                )
              );
              if (Contrat.proprietaires[j].proprietaire_list.length != 0) {
                for (
                  let k = 0;
                  k < Contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  montant_loyer_brut =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_avance_proprietaire.toFixed(2) +
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].caution_par_proprietaire.toFixed(2);

                  // Montant brut sur loyer
                  montant_loyer_brut_taxes = 0;

                  montant_tax =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].tax_avance_proprietaire.toFixed(2);

                  montant_loyer_net =
                    +montant_loyer_brut.toFixed(2) - +montant_tax.toFixed(2);

                  montant_a_verse += +montant_loyer_net.toFixed(2);

                  montant_tax_mandataire += +montant_tax.toFixed(2);

                  montant_loyer_brut_mandataire +=
                    +montant_loyer_brut.toFixed(2);

                  montant_net_without_caution =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_avance_proprietaire.toFixed(2) -
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].tax_avance_proprietaire.toFixed(2);

                  comptabilisationLoyerCrediter.push(
                    createObjectHelper.createComptLoyerCredObject(
                      Contrat,
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
                      montant_net_without_caution,
                      treatmentMonth,
                      treatmentAnnee
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

              ordreVirement.push(
                createObjectHelper.createOrderVirementObject(
                  Contrat.foncier.lieu[g],
                  Contrat.proprietaires[j],
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  treatmentMonth,
                  treatmentAnnee,
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
      treatmentMonth == dateDebutLoyer.getMonth() + 1 &&
      treatmentAnnee == dateDebutLoyer.getFullYear()
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.proprietaires.length; j++) {
            if (Contrat.proprietaires[j].is_mandataire == true) {
              montant_loyer_brut_loyer = Contrat.proprietaires[j].montant_loyer;

              if (isOverdued) {
                montant_loyer_brut_mandataire =
                  +Contrat.proprietaires[j].montant_loyer.toFixed(2);
              } else {
                montant_loyer_brut_mandataire =
                  +Contrat.proprietaires[j].caution_par_proprietaire.toFixed(
                    2
                  ) + +Contrat.proprietaires[j].montant_loyer.toFixed(2);
              }
              montant_tax_mandataire =
                +Contrat.proprietaires[j].retenue_source.toFixed(2);

              montant_loyer_net_mandataire =
                montant_loyer_brut_mandataire - montant_tax_mandataire;

              montant_a_verse = +montant_loyer_net_mandataire.toFixed(2);

              montant_net_without_caution =
                +Contrat.proprietaires[j].montant_loyer.toFixed(2) -
                +Contrat.proprietaires[j].retenue_source.toFixed(2);

              comptabilisationLoyerCrediter.push(
                createObjectHelper.createComptLoyerCredObject(
                  Contrat,
                  Contrat.proprietaires[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  montant_loyer_brut_loyer,
                  dateDebutLoyer,
                  Contrat.proprietaires[j].caution_par_proprietaire,
                  montant_net_without_caution,
                  treatmentMonth,
                  treatmentAnnee
                )
              );

              if (Contrat.proprietaires[j].proprietaire_list.length !== 0) {
                for (
                  let k = 0;
                  k < Contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  if (isOverdued) {
                    montant_loyer_brut =
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].montant_loyer.toFixed(2);
                  } else {
                    montant_loyer_brut =
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].caution_par_proprietaire.toFixed(2) +
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].montant_loyer.toFixed(2);
                  }

                  montant_tax =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].retenue_source.toFixed(2);

                  montant_loyer_net =
                    +montant_loyer_brut.toFixed(2) - +montant_tax.toFixed(2);

                  montant_loyer_brut_taxes =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_loyer.toFixed(2);

                  montant_a_verse += +montant_loyer_net.toFixed(2);

                  montant_loyer_brut_mandataire +=
                    +montant_loyer_brut.toFixed(2);

                  montant_tax_mandataire += +montant_tax.toFixed(2);

                  montant_net_without_caution =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_loyer.toFixed(2) -
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].retenue_source.toFixed(2);

                  comptabilisationLoyerCrediter.push(
                    createObjectHelper.createComptLoyerCredObject(
                      Contrat,
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
                      montant_net_without_caution,
                      treatmentMonth,
                      treatmentAnnee
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
                +Contrat.montant_loyer.toFixed(2) +
                +Contrat.montant_caution.toFixed(2);

              ordreVirement.push(
                createObjectHelper.createOrderVirementObject(
                  Contrat.foncier.lieu[g],
                  Contrat.proprietaires[j],
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  treatmentMonth,
                  treatmentAnnee,
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
      treatmentMonth == premierDateDePaiement.getMonth() + 1 &&
      treatmentAnnee == premierDateDePaiement.getFullYear()
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.proprietaires.length; j++) {
            if (Contrat.proprietaires[j].is_mandataire == true) {
              if (calculCaution) {
                montant_loyer_brut_mandataire =
                  +Contrat.proprietaires[j].montant_loyer.toFixed(2) +
                  +Contrat.proprietaires[j].caution_par_proprietaire.toFixed(2);
              } else {
                montant_loyer_brut_mandataire =
                  +Contrat.proprietaires[j].montant_loyer.toFixed(2);
              }

              montant_tax_mandataire =
                +Contrat.proprietaires[j].retenue_source.toFixed(2);

              montant_loyer_net_mandataire =
                +montant_loyer_brut_mandataire.toFixed(2) -
                +montant_tax_mandataire.toFixed(2);

              montant_loyer_brut_loyer =
                +Contrat.proprietaires[j].montant_loyer.toFixed(2);

              montant_a_verse = +montant_loyer_net_mandataire.toFixed(2);

              montant_net_without_caution =
                +Contrat.proprietaires[j].montant_apres_impot.toFixed(2);

              comptabilisationLoyerCrediter.push(
                createObjectHelper.createComptLoyerCredObject(
                  Contrat,
                  Contrat.proprietaires[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  montant_loyer_brut_loyer,
                  dateDebutLoyer,
                  calculCaution
                    ? +Contrat.proprietaires[
                        j
                      ].caution_par_proprietaire.toFixed(2)
                    : 0,
                  montant_net_without_caution,
                  treatmentMonth,
                  treatmentAnnee
                )
              );

              if (Contrat.proprietaires[j].proprietaire_list.length !== 0) {
                for (
                  let k = 0;
                  k < Contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  if (calculCaution) {
                    montant_loyer_brut =
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].montant_loyer.toFixed(2) +
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].caution_par_proprietaire.toFixed(2);
                  } else {
                    montant_loyer_brut =
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].montant_loyer.toFixed(2);
                  }

                  montant_tax =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].retenue_source.toFixed(2);

                  montant_loyer_net =
                    +montant_loyer_brut.toFixed(2) - +montant_tax.toFixed(2);

                  montant_loyer_brut_taxes =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_loyer.toFixed(2);

                  montant_a_verse += +montant_loyer_net.toFixed(2);

                  montant_loyer_brut_mandataire +=
                    +montant_loyer_brut.toFixed(2);

                  montant_tax_mandataire += +montant_tax.toFixed(2);

                  montant_net_without_caution =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_apres_impot.toFixed(2);

                  comptabilisationLoyerCrediter.push(
                    createObjectHelper.createComptLoyerCredObject(
                      Contrat,
                      Contrat.proprietaires[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      montant_loyer_brut_taxes,
                      dateDebutLoyer,
                      calculCaution
                        ? +Contrat.proprietaires[j].proprietaire_list[
                            k
                          ].caution_par_proprietaire.toFixed(2)
                        : 0,
                      montant_net_without_caution,
                      treatmentMonth,
                      treatmentAnnee
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
                  montant_loyer_brut_loyer = 0;
                  montant_loyer_brut_taxes = 0;
                }
              }

              montantDebiter = +Contrat.montant_loyer.toFixed(2);

              ordreVirement.push(
                createObjectHelper.createOrderVirementObject(
                  Contrat.foncier.lieu[g],
                  Contrat.proprietaires[j],
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  treatmentMonth,
                  treatmentAnnee,
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
      treatmentMonth == dateDeComptabilisation.getMonth() + 1 &&
      treatmentAnnee == dateDeComptabilisation.getFullYear()
    ) {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          for (let j = 0; j < Contrat.proprietaires.length; j++) {
            if (Contrat.proprietaires[j].is_mandataire == true) {
              if (calculCaution) {
                montant_loyer_brut_mandataire =
                  +Contrat.proprietaires[j].montant_loyer.toFixed(2) +
                  +Contrat.proprietaires[j].caution_par_proprietaire.toFixed(2);
              } else {
                montant_loyer_brut_mandataire =
                  +Contrat.proprietaires[j].montant_loyer.toFixed(2);
              }

              montant_loyer_brut_loyer =
                +Contrat.proprietaires[j].montant_loyer.toFixed(2);

              montant_tax_mandataire =
                +Contrat.proprietaires[j].retenue_source.toFixed(2);

              montant_loyer_net_mandataire =
                +montant_loyer_brut_mandataire.toFixed(2) -
                +montant_tax_mandataire.toFixed(2);

              montant_a_verse = +montant_loyer_net_mandataire.toFixed(2);

              montant_net_without_caution =
                +Contrat.proprietaires[j].montant_apres_impot.toFixed(2);

              comptabilisationLoyerCrediter.push(
                createObjectHelper.createComptLoyerCredObject(
                  Contrat,
                  Contrat.proprietaires[j],
                  Contrat.foncier.lieu[g],
                  dateGenerationDeComptabilisation,
                  montant_loyer_net_mandataire,
                  montant_tax_mandataire,
                  montant_loyer_brut_mandataire,
                  montant_loyer_brut_loyer,
                  dateDebutLoyer,
                  calculCaution
                    ? +Contrat.proprietaires[
                        j
                      ].caution_par_proprietaire.toFixed(2)
                    : 0,
                  montant_net_without_caution,
                  treatmentMonth,
                  treatmentAnnee
                )
              );

              if (Contrat.proprietaires[j].proprietaire_list.length !== 0) {
                for (
                  let k = 0;
                  k < Contrat.proprietaires[j].proprietaire_list.length;
                  k++
                ) {
                  if (calculCaution) {
                    montant_loyer_brut =
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].montant_loyer.toFixed(2) +
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].caution_par_proprietaire.toFixed(2);
                  } else {
                    montant_loyer_brut =
                      +Contrat.proprietaires[j].proprietaire_list[
                        k
                      ].montant_loyer.toFixed(2);
                  }

                  montant_loyer_brut_taxes =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_loyer.toFixed(2);

                  montant_tax =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].retenue_source.toFixed(2);

                  montant_loyer_net =
                    +montant_loyer_brut.toFixed(2) - +montant_tax.toFixed(2);

                  montant_a_verse += +montant_loyer_net.toFixed(2);

                  montant_loyer_brut_mandataire +=
                    +montant_loyer_brut.toFixed(2);

                  montant_tax_mandataire += +montant_tax.toFixed(2);

                  montant_net_without_caution =
                    +Contrat.proprietaires[j].proprietaire_list[
                      k
                    ].montant_apres_impot.toFixed(2);

                  comptabilisationLoyerCrediter.push(
                    createObjectHelper.createComptLoyerCredObject(
                      Contrat,
                      Contrat.proprietaires[j].proprietaire_list[k],
                      Contrat.foncier.lieu[g],
                      dateGenerationDeComptabilisation,
                      montant_loyer_net,
                      montant_tax,
                      montant_loyer_brut,
                      montant_loyer_brut_taxes,
                      dateDebutLoyer,
                      calculCaution
                        ? +Contrat.proprietaires[j].proprietaire_list[
                            k
                          ].caution_par_proprietaire.toFixed(2)
                        : 0,
                      montant_net_without_caution,
                      treatmentMonth,
                      treatmentAnnee
                    )
                  );
                  montant_loyer_net = 0;
                  montant_loyer_brut = 0;
                  montant_tax = 0;
                  montant_loyer_brut_loyer = 0;
                  montant_loyer_brut_taxes = 0;
                }
              }

              montantDebiter = +Contrat.montant_loyer.toFixed(2);

              ordreVirement.push(
                createObjectHelper.createOrderVirementObject(
                  Contrat.foncier.lieu[g],
                  Contrat.proprietaires[j],
                  Contrat.numero_contrat,
                  Contrat.periodicite_paiement,
                  treatmentMonth,
                  treatmentAnnee,
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
        let nextDateComptabilisation =
          await clotureHelper.generateNextDateComptabilisation(
            dateDeComptabilisation,
            periodicite
          );

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
