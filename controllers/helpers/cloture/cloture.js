module.exports = {
  createComptLoyerCredObject: (
    foncier,
    proprietaire,
    lieu,
    dateGenerationDeComptabilisation,
    montant_loyer_net,
    montant_tax,
    montant_loyer_brut,
    dateDebutLoyer,
    montant_caution,
    numero_contrat,
    periodicite
  ) => {
    let comptabilisationLoyerCrediter = {
      nom_de_piece: dateGenerationDeComptabilisation,
      nom_prenom: proprietaire.nom_prenom
        ? proprietaire.nom_prenom
        : proprietaire.raison_social,
      date_gl: dateGenerationDeComptabilisation,
      date_operation: dateGenerationDeComptabilisation,
      cin: proprietaire.cin,
      passport: proprietaire.passport,
      carte_sejour: proprietaire.carte_sejour,
      type: "LOY",
      adresse_proprietaire: proprietaire.adresse,
      adresse_lieu: foncier.adresse,
      origine: "PAISOFT",
      devises: "MAD",
      intitule_lieu: lieu.lieu.intitule_lieu,
      type_lieu: lieu.lieu.type_lieu,
      code_lieu: lieu.lieu.code_lieu,
      etablissement: "01",
      centre_de_cout: "NS",
      direction_regional:
        lieu.lieu.type_lieu == "Direction régionale"
          ? lieu.lieu.code_lieu
          : lieu.lieu.type_lieu == "Siège"
          ? "--"
          : lieu.lieu.attached_DR.code_lieu,
      point_de_vente:
        lieu.lieu.type_lieu == "Point de vente" ? lieu.lieu.code_lieu : "",
      numero_contrat: numero_contrat,
      periodicite: periodicite,
      montant_net: montant_loyer_net,
      montant_tax: montant_tax,
      montant_caution: montant_caution,
      montant_brut: montant_loyer_brut,
      taux_impot: proprietaire.taux_impot,
      caution_proprietaire: proprietaire.caution_par_proprietaire,
      tax_avance_proprietaire: proprietaire.tax_avance_proprietaire,
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
      intitule_lieu: lieu.lieu.intitule_lieu,
      montant_caution: montant_caution,
      numero_contrat: numero_contrat,
      direction_regional:
        lieu.lieu.type_lieu == "Direction régionale"
          ? lieu.lieu.code_lieu
          : lieu.lieu.type_lieu == "Siège"
          ? "--"
          : lieu.lieu.attached_DR.code_lieu,
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
      cin: proprietaire.cin
        ? proprietaire.cin
        : proprietaire.n_registre_commerce,
      passport: proprietaire.passport,
      carte_sejour: proprietaire.carte_sejour,
      nom_prenom: proprietaire.nom_prenom
        ? proprietaire.nom_prenom
        : proprietaire.raison_social,
      numero_compte_bancaire: proprietaire.n_compte_bancaire,
      mois: mois,
      annee: annee,
      nom_agence_bancaire: proprietaire.nom_agence_bancaire,
      banque: proprietaire.banque,
      intitule_lieu: lieu.lieu.intitule_lieu,
      type_lieu: lieu.lieu.type_lieu,
      numero_contrat: numero_contrat,
      periodicite: periodicite,
      montant_net: montant_a_verse,
      montant_brut: montant_loyer_brut,
      montant_taxe: montant_tax,
    };
    return orderVirement;
  },
};
