const Contrat = require("../../../models/contrat/contrat.model");

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
    console.log(lieu);
    let comptabilisationLoyerCrediter = {
      nom_de_piece: dateGenerationDeComptabilisation,
      nom_prenom: proprietaire.nom_prenom
        ? proprietaire.nom_prenom
        : proprietaire.raison_social,
      date_gl: dateGenerationDeComptabilisation,
      date_operation: dateGenerationDeComptabilisation,
      cin: proprietaire.cin
        ? proprietaire.cin
        : proprietaire.n_registre_commerce,
      passport: proprietaire.passport,
      carte_sejour: proprietaire.carte_sejour,
      type: "LOY",
      adresse_proprietaire: proprietaire.adresse,
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

  checkContratsAv: async (contratId) => {
    // await Contrat.findById(
    //   { _id: contratId },
    //   { deleted: false, is_avenant: true, "etat_contrat.libelle": "Actif" }
    // ).then((contrat) => {
    //   let currentMonth = nextCloture.getMonth() + 1;
    //   let currentYear = nextCloture.getFullYear();
    //   let dateDeffetAV = new Date(contratAV.date_debut_loyer);
    //   let dateDeffetAVMonth = dateDeffetAV.getMonth() + 1;
    //   let dateDeffetAVYear = dateDeffetAV.getFullYear();
    //   let dateEAV = new Date(contratAV.date_debut_loyer);
    //   let dateDeffetAVMonth = dateDeffetAV.getMonth() + 1;
    //   let dateDeffetAVYear = dateDeffetAV.getFullYear();
    //   if (
    //     (dateDeffetAVMonth == currentMonth &&
    //       dateDeffetAVYear == currentYear) &&
    //     ()
    //   ) {
    //   }
    //   if (oldContrats.length > 0) {
    //     // Get the old contrat
    //     oldContrat = oldContrats.find((contrat) => {
    //       return contrat.contrat.etat_contrat.libelle == "Actif";
    //     }).contrat;
    //     // Get old contrat's final date by subtracting 1 day from date d'effet av
    //     // dateDeffetAV.setDate(0);
    //     dateFinOldContrat = dateDeffetAV.toISOString().slice(0, 10);
    //     nextCloture = new Date(
    //       data[0].date_generation_de_comptabilisation
    //     );
    //     if (
    //       (dateDeffetAVMonth == currentMonth &&
    //         dateDeffetAVYear == currentYear) ||
    //       (dateDeffetAVMonth < currentMonth &&
    //         dateDeffetAVYear < currentYear)
    //     ) {
    //       // Customise the old contrat etat
    //       etatOldContrat = {
    //         libelle: "Modifié",
    //         etat: oldContrat.etat_contrat.etat,
    //       };
    //       // Customise the new contrat etat
    //       etatNewContrat = {
    //         libelle: "Actif",
    //         etat: contratAV.etat_contrat.etat,
    //       };
    //       // Delete proprietaires
    //       if (
    //         contratAV.etat_contrat.etat.deleted_proprietaires.length > 0
    //       ) {
    //         contratAV.etat_contrat.etat.deleted_proprietaires.forEach(
    //           (proprietaire) => {
    //             ContratHelper.deleteProprietaire(req, res, proprietaire);
    //           }
    //         );
    //       }
    //     } else {
    //       // Customise the old contrat etat
    //       etatOldContrat = oldContrat.etat_contrat;
    //       // Customise the new contrat etat
    //       etatNewContrat = contratAV.etat_contrat;
    //     }
    //     // Update the old contrat
    //     await Contrat.findByIdAndUpdate(oldContrat._id, {
    //       // date_fin_contrat: dateFinOldContrat,
    //       etat_contrat: etatOldContrat,
    //     });
    //     // Update the AV contrat
    //     await Contrat.findByIdAndUpdate(req.params.Id, {
    //       date_comptabilisation: oldContrat.date_comptabilisation,
    //       etat_contrat: etatNewContrat,
    //       validation2_DAJC: true,
    //     });
    //   }
    // });
  },
};
