const xml2js = require('xml2js');
const fs = require('fs')
const Contrat = require('../../models/contrat/contrat.model');
const { json } = require('body-parser');

module.exports = {
    createAnnex2: async (_, res) => {

        Contrat.find({ _id: '612f5ab155473640bc2b2cb4' }).populate('lieu').populate('foncier').populate({ path: 'foncier', populate: { path: 'proprietaire' } })
            .then((data) => {

                let date = new Date(data[0].date_debut_loyer)
                let currentYear = date.getFullYear()

                let Annex2 = {
                    VersementRASRF: {
                        $: {
                            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                            'xsi:noNamespaceSchemaLocation': "VersementRASRF.xsd"
                        },
                        identifiantFiscal: "IF",
                        exerciceFiscalDu: data[0].date_debut_loyer,
                        exerciceFiscalAu: data[0].etat_contrat.libelle == 'Résiliation' ? data[0].etat_contrat.etat.date_resiliation : 2021 + '-' + 12 + '-' + 31,
                        annee: currentYear,
                        mois: data[0].duree,
                        totalMntBrutLoyer: data[0].total.montant_brut_loyer,
                        totalMntRetenueSource: data[0].retenue_source,
                        totalMntNetLoyer: data[0].total.montant_net_loyer,
                        listDetailRetenueRevFoncier: {
                            DetailRetenueRevFoncier: {
                                ifuBailleur: 001,
                                numCNIBailleur: data[0].foncier.proprietaire.cin,
                                numCEBailleur: data[0].foncier.proprietaire.carte_sejour,
                                nomPrenomBailleur: data[0].foncier.proprietaire.nom_prenom,
                                adresseBailleur: data[0].foncier.proprietaire.adresse,
                                adresseBien: data[0].foncier.adresse,
                                typeBienBailleur: {
                                    code: 'LUC'
                                },
                                numTSC: 'N005',
                                mntBrutLoyerAnnuel: data[0].total_montant_brut_loyer,
                                mntRetenueSourceAnnuel: data[0].retenue_source,
                                mntNetLoyerAnnuel: data[0].total_montant_net_loyer,
                                tauxRetenueRevFoncier: {
                                    code: 'TSR.10.2018'
                                }
                            },

                        },
                    }
                };

                var builder = new xml2js.Builder();
                var xml = builder.buildObject(Annex2);
                console.dirxml(xml);

                fs.writeFile('download/Annex2.xml', xml, (err) => {
                    if (err) {
                        res.json({ message: err.message })
                    } else {
                        res.download('download/Annex2.xml')
                    }

                })

            })
            .catch((error) => {
                res.status(403).send({ message: error.message })
            })


    }
}
