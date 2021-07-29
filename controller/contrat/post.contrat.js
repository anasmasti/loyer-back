const  mongoose  = require('mongoose');
const Contrat = require('../../models/contrat/contrat.schema');


module.exports = {
    ajouterContrat: async (req, res) => {
        
        //chercher si  existe deja
        const numeroContrat = await Contrat.findOne({ numero_contrat: req.body.numero_contrat });
        if (numeroContrat) {
            return res.status(422).send({ message: 'Le numero de contrat et deja pris' });
        }

            
        //remplissage  de etat_contrat 
         let nouveauEtatContrat ={
            n_avenant: '',
            motif: '', 
            montant_nouveau_loyer: '', 
            signaletique_successeur: '',
            intitule_lieu: '',
            date_suspension: '', 
            duree_suspension:'', 
            motif_suspension:'',
            reprise_caution: '', 
            date_resiliation:'', 
            etat_lieu_sortie:'',
            preavis: ''
         };
         try{
                //remplissage
                if(req.body.etat_contrat.libelle == 'Avenant'){
                     nouveauEtatContrat = {
                        n_avenant: req.body.etat_contrat.etat.n_avenant,
                        motif: req.body.etat_contrat.etat.motif, 
                        montant_nouveau_loyer: req.body.etat_contrat.etat.montant_nouveau_loyer, 
                        signaletique_successeur: req.body.etat_contrat.etat.signaletique_successeur
                    };
                }
                else if(req.body.etat_contrat.libelle == 'Suspension'){
                     nouveauEtatContrat = {
                        intitule_lieu: req.body.etat_contrat.etat.intitule_lieu,
                        date_suspension: req.body.etat_contrat.etat.date_suspension, 
                        duree_suspension: req.body.etat_contrat.etat.duree_suspension, 
                        motif_suspension: req.body.etat_contrat.etat.motif_suspension
                    };
                }
                else if(req.body.etat_contrat.libelle == 'Résiliation'){
                    nouveauEtatContrat = {
                       intitule_lieu: req.body.etat_contrat.etat.intitule_lieu,
                       reprise_caution: req.body.etat_contrat.etat.reprise_caution, 
                       date_resiliation: req.body.etat_contrat.etat.date_resiliation, 
                       etat_lieu_sortie: req.body.etat_contrat.etat.etat_lieu_sortie,
                       preavis: req.body.etat_contrat.etat.preavis
                   };
               }
            

         }catch(error){
             res.send(error.message);
         }


        // remplissage et enregistrement de contrat 
        try{
            //remplissage
             const nouveauContrat = new Contrat({
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
                 etat_contrat:{
                    libelle: req.body.etat_contrat.libelle,
                    etat: nouveauEtatContrat
                 } ,
                 piece_joint: req.body.piece_joint
             });
             //enregistrement 
             const savedContrat = await nouveauContrat.save();
             res.send(savedContrat);
        }
        catch(error){
            res.send(error.message);
        }
       


    }
}