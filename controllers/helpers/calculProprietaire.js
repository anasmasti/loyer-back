// Calculer le montant (retenue à la source / montant apres impot / TAX)
function calculMontant(updatedContrat, part, idProprietaire) {
  // let montantLoyerForYear = montantLoyer * 12;
  let tauxImpot = 0;
  let montantApresImpot = 0;
  let result = 0;
  let duree = 0;
  // // Date debut de loyer
  let dateDebutLoyer = updatedContrat.date_debut_loyer;
  dateDebutLoyer = new Date(dateDebutLoyer);
  let month = dateDebutLoyer.getMonth() + 1;
  // // Date resilition
  let dateResiliation = updatedContrat.date_resiliation;
  dateResiliation = new Date(dateResiliation);
  let monthResiliation = dateResiliation.getMonth() + 1;
  // Les etats de contrats
  let etatContratTypes = updatedContrat.etat_contrat.libelle;

  // Get value of input pourcentage
  let pourcentageProprietaire = Number(pourcentage);
  //Get montant loyer from contrat (Montant de loyer Global)
  let montantLoyerContrat = updatedContrat.montant_loyer;

  // Montant loyer proprietaire
  let montantLoyer = 0;

  //  CALCULER LE MONTANT DE LOYER A PARTIR DE POURCENTAGE DONNE PAR L'UTILISATEUR
  montantLoyer = (pourcentageProprietaire * montantLoyerContrat) / 100;

  // // ------First Condition--------
  if (month == 1 && etatContratTypes != "Résilié") {
    duree = 12;
    if (updatedContrat.declaration_option === "non") {
      if (montantLoyer * 12 <= 30000) {
        result = 0;
        montantApresImpot = montantLoyer - result;
        tauxImpot = 0;
      }
      if (montantLoyer * 12 > 30000 && montantLoyer * 12 <= 120000) {
        result = montantLoyer * (10 / 100);
        montantApresImpot = montantLoyer - result;
        tauxImpot = 10;
      }
      if (montantLoyer * 12 > 120000) {
        result = montantLoyer * (15 / 100);
        montantApresImpot = montantLoyer - result;
        tauxImpot = 15;
      }
    }
    if (updatedContrat.declaration_option === "oui") {
      result = 0;
      montantApresImpot = montantLoyer - result;
      tauxImpot = 0;
    }
  }


  // periodicite: any[] = [
  //   {
  //     number: 1,
  //     name: 'annuelle'
  //   },
  //   {
  //     number: 4,
  //     name: 'trimestrielle'
  //   },
  //   {
  //     number: 12,
  //     name: 'mensuelle'
  //   },
  // ]

  //   //  CALCULER LE MONTANT DE LOYER A PARTIR DE PART DONNE PAR L'UTILISATEUR
  //   this.montantLoyer = ( this.partProprietaire * montantLoyerContrat ) / nbrPartContrat;
  //   // // ------First Condition--------
  //   if (etatContratTypes != 'Résilié') {
  //     this.duree = 12;
          
  //     this.periodicite.forEach(period => {
  //       if (namePeriodicite == period.name) {
  //         if (this.hasDeclarationOption === 'non') {

  //           if (this.montantLoyer * period.number <= 30000) {
  //             result = 0;
  //             montantApresImpot = this.montantLoyer - result;
  //             tauxImpot = 0;
  //           }

  //           if (this.montantLoyer * period.number > 30000 && this.montantLoyer * period.number < 120000) {
  //             result = (this.montantLoyer) * (10 / 100);
  //             montantApresImpot = this.montantLoyer - result;
  //             tauxImpot = 10;
  //           }

  //           if (this.montantLoyer * period.number >= 120000) {
  //              result = (this.montantLoyer) * (15 / 100);
  //             montantApresImpot = this.montantLoyer - result;
  //             tauxImpot = 15;
  //           }
  //         }
  //         }
  //     });
        
      
  //     if (this.hasDeclarationOption === 'oui') {
  //       result = 0;
  //       // montantApresImpot = this.montantLoyer * 12;
  //        montantApresImpot = this.montantLoyer - result;
  //       tauxImpot = 0;
  //     }

  //     this.retenueSource = result;
  //     this.montantApresImpot = montantApresImpot;
  //     this.tauxImpot = tauxImpot;

  //   }

  // // ------Seconde Condition--------
  // if (month != 1 && etatContratTypes != "Résilié") {
  //   // nombre des mois louer
  //   let nbr_mois_louer = 12 - month + 1;
  //   duree = nbr_mois_louer;

  //   if (updatedContrat.declaration_option === "non") {
  //     if (montantLoyer * nbr_mois_louer <= 30000) {
  //       result = 0;
  //       montantApresImpot = montantLoyer;
  //       tauxImpot = 0;
  //     }
  //     if (
  //       montantLoyer * nbr_mois_louer > 30000 &&
  //       montantLoyer * nbr_mois_louer <= 120000
  //     ) {
  //       result = montantLoyer * (10 / 100);
  //       // montantApresImpot =
  //       montantApresImpot = montantLoyer - result;
  //       tauxImpot = 10;
  //     }
  //     if (montantLoyer * nbr_mois_louer > 120000) {
  //       result = montantLoyer * (15 / 100);
  //       // montantApresImpot =
  //       montantApresImpot = montantLoyer - result;
  //       tauxImpot = 15;
  //     }
  //   }
  //   if (updatedContrat.declaration_option === "oui") {
  //     result = 0;
  //     montantApresImpot = montantLoyer - result;
  //     tauxImpot = 0;
  //   }
  // }

  // // ------Third Condition--------
  if (etatContratTypes == "Résilié") {
    // nombre des mois louer
    let nbr_mois_louer = monthResiliation - month + 1;
    duree = nbr_mois_louer;

    if (updatedContrat.declaration_option === "non") {
      if (montantLoyer * nbr_mois_louer <= 30000) {
        result = 0;
        montantApresImpot = montantLoyer;
        tauxImpot = 0;
      }
      if (
        montantLoyer * nbr_mois_louer > 30000 &&
        montantLoyer * nbr_mois_louer <= 120000
      ) {
        result = (montantLoyer * nbr_mois_louer * 10) / 100;
        montantApresImpot =
          (montantLoyer * nbr_mois_louer - result) / nbr_mois_louer;
        tauxImpot = 10;
      }
      if (montantLoyer * nbr_mois_louer > 120000) {
        result = (montantLoyer * nbr_mois_louer * 15) / 100;
        montantApresImpot =
          (montantLoyer * nbr_mois_louer - result) / nbr_mois_louer;
        tauxImpot = 15;
      }
    }
    if (updatedContrat.declaration_option === "oui") {
      result = 0;
      montantApresImpot = montantLoyer - result;
      tauxImpot = 0;
    }
  }

  // calculMontantAvance
  let dureeAvance = updatedContrat.duree_avance;
  let dureeLocation = updatedContrat.duree_location;
  let periodicite = updatedContrat.periodicite_paiement;

  let montantAvance = 0;
  let taxAvance = 0;

  montantAvance = montantLoyer * dureeAvance;
  taxAvance = result * dureeAvance;
  let taxPeriodicite = 0;

  if (periodicite == "mensuelle") {
    taxPeriodicite = result ;
  }
  if (periodicite == "trimestrielle") {
    taxPeriodicite = result * 3;
  }
  if (periodicite == "annuelle") {
    taxPeriodicite = result * 12;
  }

  // calculCaution
  let cautionContrat = updatedContrat.montant_caution;
  let cautionProprietaire = (cautionContrat * pourcentageProprietaire) / 100;
  let montantCautionProprietaire = cautionProprietaire;

  // let data = {
  //   id : idProprietaire,
  //   taux_impot: tauxImpot,
  //   retenue_source: result,
  //   montant_apres_impot: montantApresImpot,
  //   montant_loyer: montantLoyer,
  //   montant_avance_proprietaire: montantAvance,
  //   tax_avance_proprietaire: taxAvance,
  //   tax_par_periodicite: taxPeriodicite,
  //   caution_par_proprietaire: montantCautionProprietaire,
  // }

  return {
    taux_impot: tauxImpot,
    retenue_source: result,
    montant_apres_impot: montantApresImpot,
    montant_loyer: montantLoyer,
    montant_avance_proprietaire: montantAvance,
    tax_avance_proprietaire: taxAvance,
    tax_par_periodicite: taxPeriodicite,
    caution_par_proprietaire: montantCautionProprietaire,
  };
}


module.exports = calculMontant;
