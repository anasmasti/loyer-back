const xml2js = require('xml2js');
const fs = require('fs')

var Annex1 = {
    VersementRASRF: {
        $: {
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:noNamespaceSchemaLocation': "VersementRASRF.xsd"
        },
        identifiantFiscal: "IF",
        exerciceFiscalDu: 2021-01-01,
        exerciceFiscalAu: 2021-12-31,
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
                numTSC: 'N005',
                mntBrutLoyerAnnuel: 6000.00,
                mntRetenueSourceAnnuel: 300.00,
                mntNetLoyerAnnuel: 5600.00,
                tauxRetenueRevFoncier: {
                    code: 'TSR.10.2018'
                }
            },

        },
    }
};

var builder = new xml2js.Builder();
var xml = builder.buildObject(Annex1);
console.dirxml(xml);

fs.writeFile('../../download/Annex2.xml', xml, (err) => {
    if (err) throw err
    console.log('xml saved !');
})