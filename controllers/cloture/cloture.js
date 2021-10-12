const Contrat = require('../../models/contrat/contrat.model')
const loyerArchive = require('../../models/archive/archiveComptabilisationLoyer.schema')

module.exports = {
    clotureDuMois: async (req, res, next) => {
        let comptabilisationLoyer = []
        let contrat = await Contrat.find({ deleted: false, 'etat_contrat.libelle': { $not: { $eq: 'Résilié' } } })

        for (let i = 0; i < contrat.length; i++) {
            if (contrat[i].periodicite_paiement == 'Mensuelle') {
                let dateDebutLoyer = new Date(contrat[i].date_debut_loyer)
                let premierDateDePaiement = new Date(contrat[i].date_premier_paiement)
                let dateDeComptabilisation = new Date(contrat[i].date_comptabilisation)
                if (contrat[i].montant_avance > 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == dateDebutLoyer.getFullYear()) {
                    comptabilisationLoyer.push({
                        nom_de_piece: contrat[i].champ,
                        date_gl: contrat[i].champ,
                        date_operation: contrat[i].champ,
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: contrat[i].champ,
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: contrat[i].champ,
                        point_de_vente: contrat[i].champ,
                        montant: contrat[i].montant_avance,
                        sens: 'D',
                        date_comptabilisation: premierDateDePaiement
                    })
                }
                if (req.body.mois == (premierDateDePaiement.getMonth() + 1) && req.body.annee == (premierDateDePaiement.getFullYear())) {
                    let dateComptabilisation = premierDateDePaiement
                    comptabilisationLoyer.push({
                        nom_de_piece: contrat[i].champ,
                        date_gl: contrat[i].champ,
                        date_operation: contrat[i].champ,
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: contrat[i].champ,
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: contrat[i].champ,
                        point_de_vente: contrat[i].champ,
                        montant: contrat[i].montant_avance,
                        sens: 'D',
                        date_comptabilisation: dateComptabilisation
                    })
                    let nextDateComptabilisation = new Date(dateComptabilisation.getFullYear() + '-' + ('0' + (dateComptabilisation.getMonth() + 2)).slice(-2) + '-' + '01');
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation })
                }
                if (req.body.mois == (dateDeComptabilisation.getMonth() + 1) && req.body.annee == (dateDeComptabilisation.getFullYear())) {
                    comptabilisationLoyer.push({
                        nom_de_piece: contrat[i].champ,
                        date_gl: contrat[i].champ,
                        date_operation: contrat[i].champ,
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: contrat[i].champ,
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: contrat[i].champ,
                        point_de_vente: contrat[i].champ,
                        montant: contrat[i].montant_avance,
                        sens: 'D',
                        date_comptabilisation: dateDeComptabilisation
                    })

                    let nextDateComptabilisation = new Date(dateDeComptabilisation.getFullYear + '-' + '0' + dateDeComptabilisation.getMonth() + 2 + '01')
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation })
                }
            }
        }
        
        res.json(comptabilisationLoyer)
    }
}