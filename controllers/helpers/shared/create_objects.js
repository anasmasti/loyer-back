const Contrat = require("../../../models/contrat/contrat.model");
const ContratHelper = require("../contrat");
const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");
const archiveVirement = require("../../../models/archive/archiveVirement.schema");
const sharedHelper = require("./aggrigationObjects");

module.exports = {
  createComptLoyerCredObject: (
    Contrat,
    proprietaire,
    lieu,
    dateGenerationDeComptabilisation,
    montant_loyer_net,
    montant_tax,
    montant_brut,
    montant_brut_loyer,
    dateDebutLoyer,
    montant_caution,
    montant_net_without_caution,
    mois,
    annee,
    isOverduedAvance = false
  ) => {
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
      adresse_lieu: Contrat.foncier.adresse,
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
      numero_contrat: Contrat.numero_contrat,
      periodicite: Contrat.periodicite_paiement,
      taux_impot: proprietaire.taux_impot,
      date_comptabilisation: dateDebutLoyer,
      declaration_option: proprietaire.declaration_option,
      caution_versee: Contrat.caution_versee,
      avance_versee: Contrat.avance_versee,
      mois: mois,
      annee: annee,
      is_overdued: false,
      is_annee_antr: false,
      updatedAt: Contrat.updatedAt,
      // Montant calculés
      montant_net: +montant_loyer_net.toFixed(2),
      montant_tax: +montant_tax.toFixed(2),
      montant_brut: +montant_brut.toFixed(2),
      montant_net_without_caution: montant_net_without_caution,
      // Montants de loyer (contrat)
      montant_loyer: +proprietaire.montant_loyer.toFixed(2),
      tax_loyer: +proprietaire.tax_par_periodicite.toFixed(2),
      retenue_source: +proprietaire.retenue_source.toFixed(2),
      montant_brut_loyer: +montant_brut_loyer.toFixed(2),
      // Montants de caution
      montant_caution: +montant_caution.toFixed(2),
      caution_proprietaire: +proprietaire.caution_par_proprietaire.toFixed(2),
      // Avance
      montant_avance_proprietaire: isOverduedAvance
        ? +montant_brut.toFixed(2)
        : +proprietaire.montant_avance_proprietaire.toFixed(2),
      tax_avance_proprietaire: isOverduedAvance
        ? +montant_tax.toFixed(2)
        : +proprietaire.tax_avance_proprietaire.toFixed(2),
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
      montant_caution: +montant_caution.toFixed(2),
      numero_contrat: numero_contrat,
      direction_regional:
        lieu.lieu.type_lieu == "Direction régionale"
          ? lieu.lieu.code_lieu
          : lieu.lieu.type_lieu == "Siège"
          ? null
          : lieu.lieu.attached_DR.code_lieu || null,
      point_de_vente:
        lieu.lieu.type_lieu == "Point de vente" ? lieu.lieu.code_lieu : "",
      montant: +montantDebiter.toFixed(2),
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
      montant_net: +montant_a_verse.toFixed(2),
      montant_brut: +montant_loyer_brut.toFixed(2),
      montant_taxe: +montant_tax.toFixed(2),
      updatedAt: updatedAt ? updatedAt : "",
      is_annee_antr: false,
      is_overdued: false,
    };
    return orderVirement;
  },
};
