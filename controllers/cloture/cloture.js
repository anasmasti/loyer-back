const Contrat = require('../../models/contrat/contrat.model')
const loyerArchive = require('../../models/archive/archiveComptabilisationLoyer.schema')

module.exports = {
    clotureDuMois: async (req, res, next) => {
        let comptabilisationLoyer = []
        let contrat = await Contrat
            .find({ deleted: false, 'etat_contrat.libelle': { $not: { $eq: 'Résilié' } } })
            .populate('lieu')
            .populate({ path: 'lieu', populate: { path: 'proprietaire' } })

        //comptabilisation pour le paiement des loyers
        for (let i = 0; i < contrat.length; i++) {

            let dateDebutLoyer = new Date(contrat[i].date_debut_loyer)
            let premierDateDePaiement = new Date(contrat[i].date_premier_paiement)
            let dateDeComptabilisation = new Date(contrat[i].date_comptabilisation)
            let dateFinDeContrat = contrat[i].date_fin_contrat


            //traitement du periodicite Mensuelle
            if (contrat[i].periodicite_paiement == 'Mensuelle') {

                if (contrat[i].montant_avance > 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == dateDebutLoyer.getFullYear()) {
                    comptabilisationLoyer.push({
                        nom_de_piece: 'test',
                        date_gl: 'test',
                        date_operation: 'test',
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: 'test',
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: 'test',
                        point_de_vente: 'test',
                        montant_brut: 'test',
                        montant_tax_par_mois: 'test',
                        montant_net: 'test',
                        montant_avance_tax: 'test',
                        montant: contrat[i].montant_avance,
                        date_comptabilisation: dateDebutLoyer
                    })
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: null })
                }
                if (contrat[i].montant_avance == 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == (dateDebutLoyer.getFullYear())) {
                    comptabilisationLoyer.push({
                        nom_de_piece: 'test',
                        date_gl: 'test',
                        date_operation: 'test',
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: 'test',
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: 'test',
                        point_de_vente: 'test',
                        montant_brut: 'test',
                        montant_tax_par_mois: 'test',
                        montant_net: 'test',
                        montant_avance_tax: 'test',
                        montant: contrat[i].montant_loyer,
                        date_comptabilisation: dateDebutLoyer
                    })

                    let nextDateComptabilisation = dateDebutLoyer.setMonth(dateDebutLoyer.getMonth() + 1)
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation })
                        .then(() => {
                            console.log('Date Comptabilisation Changed !')
                        })
                        .catch((error) => {
                            res.status(402).send({ message: error.message })
                        })
                }
                if (req.body.mois == (premierDateDePaiement.getMonth() + 1) && req.body.annee == (premierDateDePaiement.getFullYear())) {
                    let dateComptabilisation = premierDateDePaiement
                    comptabilisationLoyer.push({
                        nom_de_piece: 'test',
                        date_gl: 'test',
                        date_operation: 'test',
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: 'test',
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: 'test',
                        point_de_vente: 'test',
                        montant_brut: 'test',
                        montant_tax_par_mois: 'test',
                        montant_net: 'test',
                        montant_avance_tax: 'test',
                        montant: contrat[i].montant_loyer,
                        date_comptabilisation: dateComptabilisation
                    })

                    let nextDateComptabilisation = premierDateDePaiement.setMonth(premierDateDePaiement.getMonth() + 1);
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation })
                        .then(() => {
                            console.log('Date Comptabilisation Changed !')
                        })
                        .catch((error) => {
                            res.status(402).send({ message: error.message })
                        })
                }
                if (req.body.mois == (dateDeComptabilisation.getMonth() + 1) &&
                    req.body.annee == (dateDeComptabilisation.getFullYear()) &&
                    req.body.mois <= dateFinDeContrat.getMonth() + 1 &&
                    req.body.annee <= dateFinDeContrat.getFullYear()
                ) {
                    comptabilisationLoyer.push({
                        nom_de_piece: 'test',
                        date_gl: 'test',
                        date_operation: 'test',
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: 'test',
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: 'test',
                        point_de_vente: 'test',
                        montant_brut: 'test',
                        montant_tax_par_mois: 'test',
                        montant_net: 'test',
                        montant_avance_tax: 'test',
                        montant: contrat[i].montant_loyer,
                        date_comptabilisation: dateDeComptabilisation
                    })

                    let nextDateComptabilisation = dateDeComptabilisation.setMonth(dateDeComptabilisation.getMonth() + 1)

                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation })
                        .then(() => {
                            console.log('Date Comptabilisation Changed !')
                        })
                        .catch((error) => {
                            res.status(402).send({ message: error.message })
                        })
                }
            }

            //traitement du periodicite trimestrielle
            if (contrat[i].periodicite_paiement == 'Trimestrielle') {

                if (contrat[i].montant_avance > 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == (dateDebutLoyer.getFullYear())) {
                    comptabilisationLoyer.push({
                        nom_de_piece: 'test',
                        date_gl: 'test',
                        date_operation: 'test',
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: 'test',
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: 'test',
                        point_de_vente: 'test',
                        montant_brut: 'test',
                        montant_tax_par_mois: 'test',
                        montant_net: 'test',
                        montant_avance_tax: 'test',
                        montant: contrat[i].montant_avance,
                        date_comptabilisation: dateDebutLoyer
                    })
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: null })
                }
                if (contrat[i].montant_avance == 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == (dateDebutLoyer.getFullYear())) {
                    comptabilisationLoyer.push({
                        nom_de_piece: 'test',
                        date_gl: 'test',
                        date_operation: 'test',
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: 'test',
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: 'test',
                        point_de_vente: 'test',
                        montant_brut: 'test',
                        montant_tax_par_mois: 'test',
                        montant_net: 'test',
                        montant_avance_tax: 'test',
                        montant: contrat[i].montant_loyer,
                        date_comptabilisation: dateDebutLoyer
                    })
                    let nextDateComptabilisation = dateDebutLoyer.setMonth(dateDebutLoyer.getMonth() + 3)
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation })
                        .then(() => {
                            console.log('Date Comptabilisation Changed !')
                        })
                        .catch((error) => {
                            res.status(402).send({ message: error.message })
                        })
                }
                if (req.body.mois == (premierDateDePaiement.getMonth() + 1) && req.body.annee == (premierDateDePaiement.getFullYear())) {
                    comptabilisationLoyer.push({
                        nom_de_piece: 'test',
                        date_gl: 'test',
                        date_operation: 'test',
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: 'test',
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: 'test',
                        point_de_vente: 'test',
                        montant_brut: 'test',
                        montant_tax_par_mois: 'test',
                        montant_net: 'test',
                        montant_avance_tax: 'test',
                        montant: contrat[i].montant_loyer,
                        date_comptabilisation: premierDateDePaiement
                    })
                    let nextDateComptabilisation = premierDateDePaiement.setMonth(premierDateDePaiement.getMonth() + 3)
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation })
                        .then(() => {
                            console.log('Date Comptabilisation Changed !')
                        })
                        .catch((error) => {
                            res.status(402).send({ message: error.message })
                        })
                }
                if (req.body.mois == (dateDeComptabilisation.getMonth() + 1) &&
                    req.body.annee == (dateDeComptabilisation.getFullYear()) &&
                    req.body.mois <= dateFinDeContrat.getMonth() + 1 &&
                    req.body.annee <= dateFinDeContrat.getFullYear()
                ) {
                    comptabilisationLoyer.push({
                        nom_de_piece: 'test',
                        date_gl: 'test',
                        date_operation: 'test',
                        type: 'LOY',
                        origine: 'PAISOFT',
                        devises: 'MAD',
                        description_ligne: 'test',
                        etablissement: '01',
                        compte: '64200001',
                        centre_de_cout: 'NS',
                        direction_regional: 'test',
                        point_de_vente: 'test',
                        montant_brut: 'test',
                        montant_tax_par_mois: 'test',
                        montant_net: 'test',
                        montant_avance_tax: 'test',
                        montant: contrat[i].montant_loyer,
                        date_comptabilisation: premierDateDePaiement
                    })

                    let nextDateComptabilisation = dateDeComptabilisation.setMonth(dateDeComptabilisation.getMonth() + 3)
                    await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation })
                        .then(() => {
                            console.log('Date Comptabilisation Changed !')
                        })
                        .catch((error) => {
                            res.status(402).send({ message: error.message })
                        })
                }
            }

            //traitement du periodicite Annuelle
            if (contrat[i].periodicite_paiement == 'Annuelle') {

            }
        }
        //archiver l'ecriture comptable pour le paiement des loyers
        let dateGenerationDeComptabilisation = null;
        if (req.body.mois == 12) {
            dateGenerationDeComptabilisation = new Date(req.body.annee + 1 + '-' + '01' + '-' + '01')
            console.log(dateGenerationDeComptabilisation)
        } else {
            dateGenerationDeComptabilisation = new Date(req.body.annee + '-' + ('0' + (req.body.mois + 1)).slice(-2) + '-' + '01')
            console.log(dateGenerationDeComptabilisation)

        }
        const comptabilisationLoyerArchive = new loyerArchive({
            comptabilisation_paiement_loyer: comptabilisationLoyer,
            date_generation_de_comptabilisation: dateGenerationDeComptabilisation,
            mois: req.body.mois,
            annee: req.body.annee
        })
        await comptabilisationLoyerArchive.save()
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(402).send({ message: error.message })
            })


        //archiver l'ordre des virement
        
        for (let i = 0; i < contrat.length; i++) {
            
        }




    }
}