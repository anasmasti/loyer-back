const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  modifierContrat: async (req, res) => {
   //remplissage  de etat_contrat 
   const etatContrats =  await Contrat.findById({ _id: req.params.ID } , {etat_contrat : 1 , _id:0});
  
   let index = etatContrats.etat_contrat.length;
   
   let nouveauEtatContrat ={ 
 };
   if(index==1){
     index=0;
   }
   else{
     index = index -1;
   }
   
 try{
    //remplissage
    if(req.body.etat_contrat[index].libelle == 'Avenant'){
         nouveauEtatContrat = {
          libelle: req.body.etat_contrat[index].libelle,
          updated: false,
          etat: {
            n_avenant: req.body.etat_contrat[index].etat.n_avenant,
            motif: req.body.etat_contrat[index].etat.motif, 
            montant_nouveau_loyer: req.body.etat_contrat[index].etat.montant_nouveau_loyer, 
            signaletique_successeur: req.body.etat_contrat[index].etat.signaletique_successeur
          }
        };
    }
    else if(req.body.etat_contrat[index].libelle == 'Suspension'){
         nouveauEtatContrat = {
          libelle: req.body.etat_contrat[index].libelle,
          updated: false,
          etat: {
            intitule_lieu: req.body.etat_contrat[index].etat.intitule_lieu,
            date_suspension: req.body.etat_contrat[index].etat.date_suspension, 
            duree_suspension: req.body.etat_contrat[index].etat.duree_suspension, 
            motif_suspension: req.body.etat_contrat[index].etat.motif_suspension
          }
        };
    }
    else if(req.body.etat_contrat[index].libelle == 'Résiliation'){
        nouveauEtatContrat = {
          libelle: req.body.etat_contrat[index].libelle,
          updated: false,
          etat: {
           intitule_lieu: req.body.etat_contrat[index].etat.intitule_lieu,
           reprise_caution: req.body.etat_contrat[index].etat.reprise_caution, 
           date_resiliation: req.body.etat_contrat[index].etat.date_resiliation, 
           etat_lieu_sortie: req.body.etat_contrat[index].etat.etat_lieu_sortie,
           preavis: req.body.etat_contrat[index].etat.preavis
          }
       };
   }
   
   etatContrats.etat_contrat.pop();
  
   etatContrats.etat_contrat.push(nouveauEtatContrat);
   res.json( etatContrats.etat_contrat);

}catch(error){
 res.send(error.message);
}
    try {
      //remplissage
      const updatedContrat = await Contrat.updateOne(
        { _id: req.params.ID },
        {
          numero_contrat: req.body.numero_contrat,
          date_debut_loyer: req.body.date_debut_loyer,
          date_fin_contrat: req.body.date_fin_contrat,
          date_reprise_caution: req.body.date_reprise_caution,
          date_fin_avance: req.body.date_fin_avance,
          date_premier_paiement: req.body.date_premier_paiement,
          Montant_loyer: req.body.Montant_loyer,
          taxe_edilite_loyer: req.body.taxe_edilite_loyer,
          taxe_edilite_non_loyer: req.body.taxe_edilite_non_loyer,
          periodicite_paiement: req.body.periodicite_paiement,
          duree_location: req.body.duree_location,
          declaration_option: req.body.declaration_option,
          taux_impot: req.body.taux_impot,
          retenue_source: req.body.retenue_source,
          montant_apres_impot: req.body.montant_apres_impot,
          montant_caution: req.body.montant_caution,
          effort_caution: req.body.effort_caution,
          statut_caution: req.body.statut_caution,
          montant_avance: req.body.montant_avance,
          duree_avance: req.body.duree_avance,
          N_engagement_depense: req.body.N_engagement_depense,
          echeance_revision_loyer: req.body.echeance_revision_loyer,
          proprietaire: req.body.proprietaire,
          type_lieu: req.body.type_lieu,
          lieu: req.body.lieu,
          etat_contrat: etatContrats.etat_contrat,
          piece_joint: req.body.piece_joint,
        }
      );
      //enregistrement

      res.send(updatedContrat);
    } catch (error) {
      res.send(error.message);
    }
  },

  modifierContratUpdatedEtat: async (req, res) => {
      let etatcontratArray = await Contrat.findById({ _id: req.params.ID } , {etat_contrat : 1 , _id:0});
    etatcontratArray.etat_contrat.pop();
     

    etatcontratArray.etat_contrat.push(req.body.oldEtat);
    etatcontratArray.etat_contrat.push(req.body.NewEtat);
    // res.json(etatcontratArray);

    // remplissage et enregistrement de contrat
    try {
      //remplissage
      const updatedContrat = await Contrat.updateOne(
        { _id: req.params.ID },
        {
          numero_contrat: req.body.contrat.numero_contrat,
          date_debut_loyer: req.body.contrat.date_debut_loyer,
          date_fin_contrat: req.body.contrat.date_fin_contrat,
          date_reprise_caution: req.body.contrat.date_reprise_caution,
          date_fin_avance: req.body.contrat.date_fin_avance,
          date_premier_paiement: req.body.contrat.date_premier_paiement,
          Montant_loyer: req.body.contrat.Montant_loyer,
          taxe_edilite_loyer: req.body.contrat.taxe_edilite_loyer,
          taxe_edilite_non_loyer: req.body.contrat.taxe_edilite_non_loyer,
          periodicite_paiement: req.body.contrat.periodicite_paiement,
          duree_location: req.body.contrat.duree_location,
          declaration_option: req.body.contrat.declaration_option,
          taux_impot: req.body.contrat.taux_impot,
          retenue_source: req.body.contrat.retenue_source,
          montant_apres_impot: req.body.contrat.montant_apres_impot,
          montant_caution: req.body.contrat.montant_caution,
          effort_caution: req.body.contrat.effort_caution,
          statut_caution: req.body.contrat.statut_caution,
          montant_avance: req.body.contrat.montant_avance,
          duree_avance: req.body.contrat.duree_avance,
          N_engagement_depense: req.body.contrat.N_engagement_depense,
          echeance_revision_loyer: req.body.contrat.echeance_revision_loyer,
          proprietaire: req.body.contrat.proprietaire,
          type_lieu: req.body.contrat.type_lieu,
          lieu: req.body.contrat.lieu,
          etat_contrat: etatcontratArray.etat_contrat,
        }
      );
      //enregistrement

      res.send(updatedContrat);
    } catch (error) {
      res.send(error.message);
    }
  },
};
