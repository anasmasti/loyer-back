const Contrat = require('../../models/contrat/contrat.model')
const fs = require('fs');



module.exports = {
    setComptabilisationLoyer: async (_, res) => {

        //set date de virement
        let today = new Date();
        let currentMonthName = today.toLocaleString('default', { month: 'long' })
        let dateWithSlash = '01' + '/' + ('0' + (today.getMonth() + 1)).slice(-2) + '/' + today.getFullYear();
        let dateWithDash = today.getFullYear() + '-' + ('0' + + (today.getMonth() + 1)).slice(-2) + '-' + '01';

        //delete data from file if exist
        fs.writeFile('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt', '', { flag: 'w' }, (error) => {
            if (error) throw error
        })


        //add zeros (0)
        function pad(number, count) {
            return (1e15 + number + '').slice(-count);
        }

        Contrat.find().populate('lieu').populate('foncier').populate({ path: 'foncier', populate: { path: 'proprietaire' } })
            .then((data) => {
                let codeDr = "";
                let codePv = "";
                let lieuIntitule = "";
                let cinProprietaire = "";

                //ecriture comptable du loyer Sens D
                for (let index = 0; index < data.length; index++) {

                    //set the code of DR and lieu intitulé
                    if (data[index].lieu.type_lieu == 'Direction régionale') {
                        codeDr = data[index].lieu.code_lieu
                        lieuIntitule = data[index].lieu.intitule_lieu
                    } else if (data[index].lieu.type_lieu == 'Logement de fonction' || data[index].lieu.type_lieu == 'Point de vente' || data[index].lieu.type_lieu == 'Supervision') {
                        codeDr = data[index].lieu.code_rattache_DR
                        lieuIntitule = data[index].lieu.intitule_lieu
                    } else {
                        codeDr = '-|-'
                    }

                    //set the code of PV if exist
                    if (data[index].lieu.type_lieu == 'Point de vente') {
                        codePv = data[index].lieu.code_lieu
                    } else {
                        codePv = '-|-'
                    }

                    let montantLoyer = data[index].montant_loyer

                    let addTwoNumbersAfterComma = montantLoyer.toFixed(2)
                    let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                    let fullMontant = pad(replacePointWithComma, 9)
                    let ecritureDebiterLoyer = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithDash + ' 00:00:00|' + currentMonthName.toUpperCase() + '-' + today.getFullYear() + '|' + dateWithDash + ' 00:00:00|LOY|PAISOFT|MAD|' + lieuIntitule + '/' + dateWithSlash + '|01|' + codeDr + '|' + codePv + '|' + fullMontant + '|D|\n'
                    // Frais Loyer-|GFL -' + (today.getMonth() + 1) + '-' + today.getFullYear() + '||-
                    fs.writeFileSync('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt', ecritureDebiterLoyer, { flag: "a" }, (error) => {
                        if (error) res.json({ message: error.message })
                    })
                }

                //ecriture comptable Sens C 'Montant Net'
                for (let index = 0; index < data.length; index++) {

                    //set the code of DR and lieu intitulé
                    lieuIntitule = data[index].lieu.intitule_lieu

                    //montant net
                    let montantNet = data[index].montant_apres_impot

                    //cin proprietaire
                    cinProprietaire = data[index].foncier.proprietaire.cin

                    let addTwoNumbersAfterComma = montantNet.toFixed(2)
                    let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                    let fullMontantNet = pad(replacePointWithComma, 9)
                    let ecritureCrediterDuMontantNetLoyer = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithDash + ' 00:00:00|' + currentMonthName.toUpperCase() + '-' + today.getFullYear() + '|' + dateWithDash + ' 00:00:00|LOY|PAISOFT|MAD|' + dateWithSlash + '|01|10200000|NS|NS|S05|' + fullMontantNet + '|C|\n'
                    // Frais Loyer-' + cinProprietaire + '|GFL -' + (today.getMonth() + 1) + '-' + today.getFullYear() + '||-
                    fs.writeFileSync('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt', ecritureCrediterDuMontantNetLoyer, { flag: 'a' }, (error) => {
                        if (error) res.json({ message: error.message })
                    })
                }

                //ecriture comptable Sens C 'Tax'
                for (let index = 0; index < data.length; index++) {

                    //set the code of DR and lieu intitulé
                    lieuIntitule = data[index].lieu.intitule_lieu

                    //calcule montant de Tax
                    let montantLoyer = data[index].montant_loyer
                    let montantNet = data[index].montant_apres_impot
                    let tax = montantLoyer - montantNet

                    let addTwoNumbersAfterComma = tax.toFixed(2)
                    let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                    let fullTax = pad(replacePointWithComma, 9)

                    //cin proprietaire
                    cinProprietaire = data[index].foncier.proprietaire.cin

                    let ecritureCrediterDuTaxLoyer = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithDash + ' 00:00:00|' + currentMonthName.toUpperCase() + '-' + today.getFullYear() + '|' + dateWithDash + ' 00:00:00|LOY|PAISOFT|MAD|' + lieuIntitule + '/' + dateWithSlash + '|01|327007|NS|NS|S05|-|-|-|-|-|-|-|' + fullTax + '|C|\n'
                    //Frais Loyer-' + cinProprietaire + '|GFL -' + (today.getMonth() + 1) + '-' + today.getFullYear() + '||-

                    fs.writeFileSync('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt', ecritureCrediterDuTaxLoyer, { flag: 'a' }, (error) => {
                        if (error) res.json({ message: error.message })
                    })
                }
                
                res.download('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt')

            })
            .catch((error) => {
                res.json({ message: error.message })
            })

    }
}
