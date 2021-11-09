const Contrat = require('../../models/contrat/contrat.model')
const loyerArchive = require('../../models/archive/archiveComptabilisationLoyer.schema')
const ordreVirementArchive = require('../../models/archive/archiveVirement.schema')
const archiveComptabilisationLoyer = require('../../models/archive/archiveComptabilisationLoyer.schema')

module.exports = {
    clotureDuMois: async (req, res, next) => {
        let comptabilisationLoyer = [], ordreVirement = []

        //get current contrat of this month
        let contrat = await Contrat
            .find({ deleted: false, 'etat_contrat.etat.reprise_caution': { $not: { $eq: 'consommée' } } })
            .populate('lieu')
            .populate({ path: 'lieu', populate: { path: 'proprietaire' } })

        //traitement pour date generation de comptabilisation
        let dateGenerationDeComptabilisation = null;
        if (req.body.mois == 12) {
            dateGenerationDeComptabilisation = new Date(req.body.annee + 1 + '-' + '01' + '-' + '01')
        } else {
            dateGenerationDeComptabilisation = new Date(req.body.annee + '-' + ('0' + (req.body.mois + 1)).slice(-2) + '-' + '01')
        }

        //comptabilisation pour le paiement des loyers
        for (let i = 0; i < contrat.length; i++) {

            let dateDebutLoyer = new Date(contrat[i].date_debut_loyer)
            let premierDateDePaiement = new Date(contrat[i].date_premier_paiement)
            let dateDeComptabilisation = new Date(contrat[i].date_comptabilisation)
            let dateFinDeContrat = contrat[i].date_fin_contrat
            let montant_avance_net = 0, montant_avance_brut = 0, montant_loyer_net = 0, montant_loyer_brut = 0;

            //traitement du periodicite Mensuelle
            if (contrat[i].periodicite_paiement == 'mensuelle') {

                if (contrat[i].montant_avance > 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == dateDebutLoyer.getFullYear()) {
                    for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                        if (contrat[i].lieu.proprietaire[j].mandataire == true) {

                            if (contrat[i].caution_versee == false) {
                                montant_avance_net = (contrat[i].lieu.proprietaire[j].montant_avance_proprietaire - contrat[i].lieu.proprietaire[j].tax_avance_proprietaire) + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                                montant_avance_brut = contrat[i].lieu.proprietaire[j].montant_avance_proprietaire + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                            } else {
                                montant_avance_net = contrat[i].lieu.proprietaire[j].montant_avance_proprietaire - contrat[i].lieu.proprietaire[j].tax_avance_proprietaires
                                montant_avance_brut = contrat[i].lieu.proprietaire[j].montant_avance_proprietaire
                            }

                            ordreVirement.push({
                                type_enregistrement: "0602",
                                cin: contrat[i].lieu.proprietaire[j].cin,
                                nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                                numero_compte_bancaire: contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                                banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                                ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                                cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                                mois: req.body.mois,
                                annee: req.body.annee,
                                montant_net: montant_avance_net
                            })

                            comptabilisationLoyer.push({
                                nom_de_piece: dateGenerationDeComptabilisation,
                                date_gl: dateGenerationDeComptabilisation,
                                date_operation: dateGenerationDeComptabilisation,
                                type: 'LOY',
                                origine: 'PAISOFT',
                                devises: 'MAD',
                                intitule_lieu: contrat[i].lieu.intitule_lieu,
                                code_lieu: contrat[i].lieu.code_lieu,
                                etablissement: '01',
                                centre_de_cout: 'NS',
                                direction_regional: contrat[i].lieu.type_lieu == "Direction régionale" ? contrat[i].lieu.code_lieu : contrat[i].lieu.code_rattache_DR,
                                point_de_vente: contrat[i].lieu.type_lieu == "Point de vente" ? contrat[i].lieu.code_lieu : "",
                                montant_net: montant_avance_net,
                                montant_tax: contrat[i].lieu.proprietaire[j].tax_avance_proprietaire,
                                montant_brut: montant_avance_brut,
                                date_comptabilisation: dateDebutLoyer
                            })
                            await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: null, caution_versee: true })
                        }
                    }

                }
                if (contrat[i].montant_avance == 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == (dateDebutLoyer.getFullYear())) {

                    for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                        if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                            if (contrat[i].caution_versee == false) {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                            } else {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer
                            }
                            ordreVirement.push({
                                type_enregistrement: "0602",
                                cin: contrat[i].lieu.proprietaire[j].cin,
                                nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                                numero_compte_bancaire: contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                                banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                                ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                                cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                                mois: req.body.mois,
                                annee: req.body.annee,
                                montant_net: montant_loyer_net
                            })

                            comptabilisationLoyer.push({
                                nom_de_piece: dateGenerationDeComptabilisation,
                                date_gl: dateGenerationDeComptabilisation,
                                date_operation: dateGenerationDeComptabilisation,
                                type: 'LOY',
                                origine: 'PAISOFT',
                                devises: 'MAD',
                                intitule_lieu: contrat[i].lieu.intitule_lieu,
                                code_lieu: contrat[i].lieu.code_lieu,
                                etablissement: '01',
                                centre_de_cout: 'NS',
                                direction_regional: contrat[i].lieu.type_lieu == "Direction régionale" ? contrat[i].lieu.code_lieu : contrat[i].lieu.code_rattache_DR,
                                point_de_vente: contrat[i].lieu.type_lieu == "Point de vente" ? contrat[i].lieu.code_lieu : "",
                                montant_brut: montant_loyer_brut,
                                montant_tax: contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                                montant_net: montant_loyer_net,
                                date_comptabilisation: dateDebutLoyer
                            })

                            let nextDateComptabilisation = dateDebutLoyer.setMonth(dateDebutLoyer.getMonth() + 1)
                            await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation, caution_versee: true })
                                .then(() => {
                                    console.log('Date Comptabilisation Changed !')
                                })
                                .catch((error) => {
                                    res.status(402).send({ message: error.message })
                                })
                        }
                    }
                }
                if (req.body.mois == (premierDateDePaiement.getMonth() + 1) &&
                    req.body.annee == (premierDateDePaiement.getFullYear())) {

                    for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                        if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                            if (contrat[i].caution_versee == false) {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                            } else {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer
                            }
                            ordreVirement.push({
                                type_enregistrement: "0602",
                                cin: contrat[i].lieu.proprietaire[j].cin,
                                nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                                numero_compte_bancaire: contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                                banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                                ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                                cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                                mois: req.body.mois,
                                annee: req.body.annee,
                                montant_net: montant_loyer_net
                            })

                            let dateComptabilisation = premierDateDePaiement
                            comptabilisationLoyer.push({
                                nom_de_piece: dateGenerationDeComptabilisation,
                                date_gl: dateGenerationDeComptabilisation,
                                date_operation: dateGenerationDeComptabilisation,
                                type: 'LOY',
                                origine: 'PAISOFT',
                                devises: 'MAD',
                                intitule_lieu: contrat[i].lieu.intitule_lieu,
                                code_lieu: contrat[i].lieu.code_lieu,
                                etablissement: '01',
                                centre_de_cout: 'NS',
                                direction_regional: contrat[i].lieu.type_lieu == "Direction régionale" ? contrat[i].lieu.code_lieu : contrat[i].lieu.code_rattache_DR,
                                point_de_vente: contrat[i].lieu.type_lieu == "Point de vente" ? contrat[i].lieu.code_lieu : "",
                                montant_brut: montant_loyer_brut,
                                montant_tax: contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                                montant_net: montant_loyer_net,
                                date_comptabilisation: dateComptabilisation
                            })


                            let nextDateComptabilisation = premierDateDePaiement.setMonth(premierDateDePaiement.getMonth() + 1);
                            await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation, caution_versee: true })
                                .then(() => {
                                    console.log('Date Comptabilisation Changed !')
                                })
                                .catch((error) => {
                                    res.status(402).send({ message: error.message })
                                })
                        }
                    }
                }
                if (req.body.mois == (dateDeComptabilisation.getMonth() + 1) &&
                    req.body.annee == (dateDeComptabilisation.getFullYear()) &&
                    req.body.mois <= dateFinDeContrat.getMonth() + 1 &&
                    req.body.annee <= dateFinDeContrat.getFullYear()
                ) {
                    for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                        if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                            if (contrat[i].caution_versee == false) {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                            } else {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer
                            }
                            ordreVirement.push({
                                type_enregistrement: "0602",
                                cin: contrat[i].lieu.proprietaire[j].cin,
                                nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                                numero_compte_bancaire: contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                                banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                                ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                                cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                                mois: req.body.mois,
                                annee: req.body.annee,
                                montant_net: montant_loyer_net
                            })
                            comptabilisationLoyer.push({
                                nom_de_piece: dateGenerationDeComptabilisation,
                                date_gl: dateGenerationDeComptabilisation,
                                date_operation: dateGenerationDeComptabilisation,
                                type: 'LOY',
                                origine: 'PAISOFT',
                                devises: 'MAD',
                                intitule_lieu: contrat[i].lieu.intitule_lieu,
                                code_lieu: contrat[i].lieu.code_lieu,
                                etablissement: '01',
                                centre_de_cout: 'NS',
                                direction_regional: contrat[i].lieu.type_lieu == "Direction régionale" ? contrat[i].lieu.code_lieu : contrat[i].lieu.code_rattache_DR,
                                point_de_vente: contrat[i].lieu.type_lieu == "Point de vente" ? contrat[i].lieu.code_lieu : "",
                                montant_brut: montant_loyer_brut,
                                montant_tax: contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                                montant_net: montant_loyer_net,
                                date_comptabilisation: dateDeComptabilisation
                            })

                            let nextDateComptabilisation = dateDeComptabilisation.setMonth(dateDeComptabilisation.getMonth() + 1)

                            await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation, caution_versee: true })
                                .then(() => {
                                    console.log('Date Comptabilisation Changed !')
                                })
                                .catch((error) => {
                                    res.status(402).send({ message: error.message })
                                })
                        }
                    }
                }
            }

            //traitement du periodicite trimestrielle
            if (contrat[i].periodicite_paiement == 'trimestrielle') {

                if (contrat[i].montant_avance > 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == (dateDebutLoyer.getFullYear())) {

                    for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                        if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                            if (contrat[i].caution_versee == false) {
                                montant_avance_net = (contrat[i].lieu.proprietaire[j].montant_avance_proprietaire - contrat[i].lieu.proprietaire[j].tax_avance_proprietaire) + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                                montant_avance_brut = contrat[i].lieu.proprietaire[j].montant_avance_proprietaire + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                            } else {
                                montant_avance_net = contrat[i].lieu.proprietaire[j].montant_avance_proprietaire - contrat[i].lieu.proprietaire[j].tax_avance_proprietaires
                                montant_avance_brut = contrat[i].lieu.proprietaire[j].montant_avance_proprietaire
                            }
                            ordreVirement.push({
                                type_enregistrement: "0602",
                                cin: contrat[i].lieu.proprietaire[j].cin,
                                nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                                numero_compte_bancaire: contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                                banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                                ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                                cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                                mois: req.body.mois,
                                annee: req.body.annee,
                                montant_net: montant_avance_net
                            })

                            comptabilisationLoyer.push({
                                nom_de_piece: dateGenerationDeComptabilisation,
                                date_gl: dateGenerationDeComptabilisation,
                                date_operation: dateGenerationDeComptabilisation,
                                type: 'LOY',
                                origine: 'PAISOFT',
                                devises: 'MAD',
                                intitule_lieu: contrat[i].lieu.intitule_lieu,
                                code_lieu: contrat[i].lieu.code_lieu,
                                etablissement: '01',
                                centre_de_cout: 'NS',
                                direction_regional: contrat[i].lieu.type_lieu == "Direction régionale" ? contrat[i].lieu.code_lieu : contrat[i].lieu.code_rattache_DR,
                                point_de_vente: contrat[i].lieu.type_lieu == "Point de vente" ? contrat[i].lieu.code_lieu : "",
                                montant_tax: contrat[i].lieu.proprietaire[j].tax_avance_proprietaire,
                                montant_brut: montant_avance_brut,
                                montant_net: montant_avance_net,
                                date_comptabilisation: dateDebutLoyer
                            })
                            await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: null, caution_versee: true })
                        }
                    }
                }
                if (contrat[i].montant_avance == 0 && req.body.mois == (dateDebutLoyer.getMonth() + 1) && req.body.annee == (dateDebutLoyer.getFullYear())) {

                    for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                        if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                            if (contrat[i].caution_versee == false) {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                            } else {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer
                            }
                            ordreVirement.push({
                                type_enregistrement: "0602",
                                cin: contrat[i].lieu.proprietaire[j].cin,
                                nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                                numero_compte_bancaire: contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                                banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                                ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                                cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                                mois: req.body.mois,
                                annee: req.body.annee,
                                montant_net: montant_loyer_net
                            })

                            comptabilisationLoyer.push({
                                nom_de_piece: dateGenerationDeComptabilisation,
                                date_gl: dateGenerationDeComptabilisation,
                                date_operation: dateGenerationDeComptabilisation,
                                type: 'LOY',
                                origine: 'PAISOFT',
                                devises: 'MAD',
                                intitule_lieu: contrat[i].lieu.intitule_lieu,
                                code_lieu: contrat[i].lieu.code_lieu,
                                etablissement: '01',
                                centre_de_cout: 'NS',
                                direction_regional: contrat[i].lieu.type_lieu == "Direction régionale" ? contrat[i].lieu.code_lieu : contrat[i].lieu.code_rattache_DR,
                                point_de_vente: contrat[i].lieu.type_lieu == "Point de vente" ? contrat[i].lieu.code_lieu : "",
                                montant_brut: montant_loyer_brut,
                                montant_tax: contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                                montant_net: montant_loyer_net,
                                date_comptabilisation: dateDebutLoyer
                            })
                            let nextDateComptabilisation = dateDebutLoyer.setMonth(dateDebutLoyer.getMonth() + 3)
                            await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation, caution_versee: true })
                                .then(() => {
                                    console.log('Date Comptabilisation Changed !')
                                })
                                .catch((error) => {
                                    res.status(402).send({ message: error.message })
                                })
                        }
                    }
                }
                if (req.body.mois == (premierDateDePaiement.getMonth() + 1) && req.body.annee == (premierDateDePaiement.getFullYear())) {

                    for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                        if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                            if (contrat[i].caution_versee == false) {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                            } else {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer
                            }
                            ordreVirement.push({
                                type_enregistrement: "0602",
                                cin: contrat[i].lieu.proprietaire[j].cin,
                                nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                                numero_compte_bancaire: contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                                banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                                ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                                cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                                mois: req.body.mois,
                                annee: req.body.annee,
                                montant_net: montant_loyer_net
                            })

                            comptabilisationLoyer.push({
                                nom_de_piece: dateGenerationDeComptabilisation,
                                date_gl: dateGenerationDeComptabilisation,
                                date_operation: dateGenerationDeComptabilisation,
                                type: 'LOY',
                                origine: 'PAISOFT',
                                devises: 'MAD',
                                intitule_lieu: contrat[i].lieu.intitule_lieu,
                                code_lieu: contrat[i].lieu.code_lieu,
                                etablissement: '01',
                                centre_de_cout: 'NS',
                                direction_regional: contrat[i].lieu.type_lieu == "Direction régionale" ? contrat[i].lieu.code_lieu : contrat[i].lieu.code_rattache_DR,
                                point_de_vente: contrat[i].lieu.type_lieu == "Point de vente" ? contrat[i].lieu.code_lieu : "",
                                montant_brut: montant_loyer_brut,
                                montant_tax: contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                                montant_net: montant_loyer_net,
                                date_comptabilisation: premierDateDePaiement
                            })
                            let nextDateComptabilisation = premierDateDePaiement.setMonth(premierDateDePaiement.getMonth() + 3)
                            await Contrat.findByIdAndUpdate({ _id: contrat[i]._id }, { date_comptabilisation: nextDateComptabilisation, caution_versee: true })
                                .then(() => {
                                    console.log('Date Comptabilisation Changed !')
                                })
                                .catch((error) => {
                                    res.status(402).send({ message: error.message })
                                })
                        }
                    }
                }
                if (req.body.mois == (dateDeComptabilisation.getMonth() + 1) &&
                    req.body.annee == (dateDeComptabilisation.getFullYear()) &&
                    req.body.mois <= dateFinDeContrat.getMonth() + 1 &&
                    req.body.annee <= dateFinDeContrat.getFullYear()
                ) {

                    for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                        if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                            if (contrat[i].caution_versee == false) {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer + contrat[i].lieu.proprietaire[j].caution_par_proprietaire
                            } else {
                                montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot
                                montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer
                            }
                            ordreVirement.push({
                                type_enregistrement: "0602",
                                cin: contrat[i].lieu.proprietaire[j].cin,
                                nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                                numero_compte_bancaire: contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                                banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                                ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                                cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                                mois: req.body.mois,
                                annee: req.body.annee,
                                montant_net: montant_loyer_net
                            })

                            comptabilisationLoyer.push({
                                nom_de_piece: dateGenerationDeComptabilisation,
                                date_gl: dateGenerationDeComptabilisation,
                                date_operation: dateGenerationDeComptabilisation,
                                type: 'LOY',
                                origine: 'PAISOFT',
                                devises: 'MAD',
                                intitule_lieu: contrat[i].lieu.intitule_lieu,
                                code_lieu: contrat[i].lieu.code_lieu,
                                etablissement: '01',
                                centre_de_cout: 'NS',
                                direction_regional: contrat[i].lieu.type_lieu == "Direction régionale" ? contrat[i].lieu.code_lieu : contrat[i].lieu.code_rattache_DR,
                                point_de_vente: contrat[i].lieu.type_lieu == "Point de vente" ? contrat[i].lieu.code_lieu : "",
                                montant_brut: montant_loyer_brut,
                                montant_tax: contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                                montant_net: montant_loyer_net,
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
                }
            }

            //traitement du periodicite Annuelle
            if (contrat[i].periodicite_paiement == 'annuelle') {

            }
        }

        //post ordre de virement dans ordre de virement archive
        const ordeVirementLoyer = new ordreVirementArchive({
            ordre_virement: ordreVirement,
            date_generation_de_virement: dateGenerationDeComptabilisation,
            mois: req.body.mois,
            annee: req.body.annee
        })
        //post comptabilisation des loyer dans comptabilisation des loyer archive    
        const comptabilisationLoyerArchive = new loyerArchive({
            comptabilisation_paiement_loyer: comptabilisationLoyer,
            date_generation_de_comptabilisation: dateGenerationDeComptabilisation,
            mois: req.body.mois,
            annee: req.body.annee
        })
        ordeVirementLoyer.save()
            .then(async (virementData) => {
                await comptabilisationLoyerArchive.save()
                    .then((comptabilisationData) => {
                        res.json([comptabilisationData, virementData])
                    })
                    .catch((error) => {
                        res.status(402).send({ message: error.message })
                    })
            })
            .catch((error) => {
                res.status(401).send({ message: error.message })
            })


    },


    getClotureDate: async (req, res) => {
        // let Result;
        // await archiveComptabilisationLoyer.find()
        // .sort({ date_generation_de_comptabilisation: "desc" })
        // .then((data) => {
        //     Result = data[0]
        //     let date = new Date(data[0].date_generation_de_comptabilisation);
        //     res.json({mois: date.getMonth() + 1 , annee: date.getFullYear() }) 
        //     // res.json({ nextCloture: Result.date_generation_de_comptabilisation}) 
                
        // })
        // .catch((error) => {
        //   res.status(402).send({ message: error.message });
        // });
        let date = new Date();
        res.json({mois: date.getMonth() + 1 , annee: date.getFullYear() }) 
    }

}