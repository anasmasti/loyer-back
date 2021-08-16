const Contrat = require('../../models/contrat/contrat.model');


module.exports = { 
    ajouterContrat: async (req, res) => {
        // variables
        let piece_joint_contrat = [], item = 0

        //parse incoming data to json
        let data = await JSON.parse(req.body.data)
        console.log(data);

        
        //stock file in array
        if (req.files) {
            for (item in req.files.piece_joint_contrat) {
                piece_joint_contrat.push({ image: req.files.piece_joint_contrat[item].path })
            }
        }

        let countContrat = await Contrat.countDocuments()

        //store contrat
        const nouveauContrat = new Contrat({
            numero_contrat: countContrat + 1 ,
            date_debut_loyer: data.date_debut_loyer,
            date_fin_contrat: data.date_fin_contrat,
            date_reprise_caution: data.date_reprise_caution,
            date_fin_avance: data.date_fin_avance,
            date_premier_paiement: data.date_premier_paiement,
            Montant_loyer: data.Montant_loyer,
            taxe_edilite_loyer: data.taxe_edilite_loyer,
            taxe_edilite_non_loyer: data.taxe_edilite_non_loyer,
            periodicite_paiement: data.periodicite_paiement,
            duree_location: data.duree_location,
            declaration_option: data.declaration_option,
            taux_impot: data.taux_impot,
            retenue_source: data.retenue_source,
            montant_apres_impot: data.montant_apres_impot,
            montant_caution: data.montant_caution,
            effort_caution: data.effort_caution,
            statut_caution: data.statut_caution,
            montant_avance: data.montant_avance,
            duree_avance: data.duree_avance,
            N_engagement_depense: data.N_engagement_depense,
            echeance_revision_loyer: data.echeance_revision_loyer,
            proprietaire: data.proprietaire,
            type_lieu: data.type_lieu,
            lieu: data.lieu,
            etat_contrat: {
                libelle: 'initié',
            },
            piece_joint: piece_joint_contrat
        }); 
        await nouveauContrat.save()
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(400).send({ message: error.message })
            })
    }
}