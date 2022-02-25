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
    montant_caution
  ) => {
    let comptabilisationLoyerCrediter = {
      nom_de_piece: dateGenerationDeComptabilisation,
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
      code_lieu: lieu.lieu.code_lieu,
      etablissement: "01",
      centre_de_cout: "NS",
      direction_regional:
        lieu.lieu.type_lieu == "Direction régionale"
          ? lieu.lieu.code_lieu
          : lieu.lieu.code_rattache_DR,
      point_de_vente:
        lieu.lieu.type_lieu == "Point de vente" ? lieu.lieu.code_lieu : "",
      montant_net: montant_loyer_net,
      montant_tax: montant_tax,
      montant_caution: montant_caution,
      montant_brut: montant_loyer_brut,
      date_comptabilisation: dateDebutLoyer,
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
          : lieu.lieu.code_rattache_DR,
      point_de_vente:
        lieu.lieu.type_lieu == "Point de vente" ? lieu.lieu.code_lieu : "",
      montant: montantDebiter,
    };
    return comptabilisationLoyerDebite;
  },

  createOrderVirementObject: (proprietaire, mois, annee, montant_a_verse) => {
    let orderVirement = {
      type_enregistrement: "0602",
      cin: proprietaire.cin,
      passport: proprietaire.passport,
      carte_sejour: proprietaire.carte_sejour,
      nom_prenom: proprietaire.nom_prenom,
      numero_compte_bancaire: proprietaire.n_compte_bancaire,
      mois: mois,
      annee: annee,
      nom_agence_bancaire: proprietaire.nom_agence_bancaire,
      montant_net: montant_a_verse,
    };
    return orderVirement;
  },
};
