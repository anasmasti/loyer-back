const Contrat = require("../../models/contrat/contrat.model");
const Lieu = require("../../models/lieu/lieu.model");
const mongoose = require('mongoose')

module.exports = {
    ajouterContrat: async (req, res) => {
        // variables
        let piece_joint_contrat = [],
            item = 0;

        if (Object.keys(req.body).length === 0)
            return res.status(402).send({ message: "Please fill the required :)" });

        //parse incoming data to json
        let data = await JSON.parse(req.body.data);

        //stock file in array
        if (req.files) {
            if (req.files.piece_joint_contrat) {
                for (item in req.files.piece_joint_contrat) {
                    piece_joint_contrat.push({
                        image: req.files.piece_joint_contrat[item].path,
                    });
                }
            }
        }
        let requestedLieu = await Lieu.findById({_id: mongoose.Types.ObjectId(data.lieu)})
        let numeroContrat = requestedLieu.code_lieu +'/'+ requestedLieu.intitule_lieu
        //store contrat
        const nouveauContrat = new Contrat({
            numero_contrat: numeroContrat,
            date_debut_loyer: data.date_debut_loyer,
            date_fin_contrat: data.date_fin_contrat,
            date_reprise_caution: data.date_reprise_caution,
            date_premier_paiement: data.date_premier_paiement,
            montant_loyer: data.montant_loyer,
            taxe_edilite_loyer: data.taxe_edilite_loyer,
            taxe_edilite_non_loyer: data.taxe_edilite_non_loyer,
            periodicite_paiement: data.periodicite_paiement,
            duree_location: data.duree_location,
            declaration_option: data.declaration_option,
            taux_impot: data.taux_impot,
            duree: data.duree,
            retenue_source_par_mois: data.retenue_source_par_mois,
            total_montant_brut_loyer: data.total_montant_brut_loyer,
            total_montant_net_loyer: data.total_montant_net_loyer,
            retenue_source: data.retenue_source,
            montant_apres_impot: data.montant_apres_impot,
            montant_caution: data.montant_caution,
            effort_caution: data.effort_caution,
            statut_caution: data.statut_caution,
            montant_avance: data.montant_avance,
            date_fin_avance: data.date_fin_avance,
            duree_avance: data.duree_avance,
            n_engagement_depense: data.n_engagement_depense,
            echeance_revision_loyer: data.echeance_revision_loyer,
            date_comptabilisation: null,
            type_lieu: data.type_lieu,
            lieu: data.lieu,
            etat_contrat: {
                libelle: 'Actif',
                etat: {}
            },
            piece_joint_contrat: piece_joint_contrat
        });
        await nouveauContrat.save()
            .then(async (data) => {
                await Lieu.findByIdAndUpdate({ _id: data.lieu }, { has_contrat: true })
                res.json(data)
            })
            .catch((error) => {
                res.status(400).send({ message: error.message })
            })
    }
}
