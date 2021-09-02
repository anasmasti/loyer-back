const xml2js = require('xml2js');
const fs = require('fs')



module.exports = {
    createAnnex1: async (_, res) => {

        let Annex1 = {
            VersementRASRF: {
                $: {
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    'xsi:noNamespaceSchemaLocation': "VersementRASRF.xsd"
                },
                identifiantFiscal: "IF",
                exerciceFiscalDu: 2021 - 01 - 01,
                exerciceFiscalAu: 2021 - 12 - 31,
                annee: 2020,
                mois: 1,
                totalMntBrutLoyer: 6000.00,
                totalMntRetenueSource: 300.00,
                totalMntNetLoyer: 5600.00,
                listDetailRetenueRevFoncier: {
                    DetailRetenueRevFoncier: {
                        ifuBailleur: 001,
                        numCNIBailleur: 'HY123456',
                        numCEBailleur: '',
                        nomPrenomBailleur: 'Badr El Azzaby',
                        adresseBailleur: 'MAARIF RUE AL FOURATE',
                        adresseBien: 'BEAUSEJOUR QUARTIER BURGER',
                        typeBienBailleur: {
                            code: 'LUC'
                        },
                        mntBrutLoyer: 6000.00,
                        mntRetenueSource: 300.00,
                        mntNetLoyer: 5600.00,
                        tauxRetenueRevFoncier: {
                            code: 'TSR.10.2018'
                        }
                    },

                },
            }
        };

        var builder = new xml2js.Builder();
        var xml = builder.buildObject(Annex1);
        
        fs.writeFile('download/Annex1.xml', xml, (err) => {
            if (err) {
                res.json({ message: err.message });
            } else {
                res.download('download/Annex1.xml')
            }

        })
    },

}
