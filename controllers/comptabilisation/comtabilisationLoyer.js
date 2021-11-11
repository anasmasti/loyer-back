const fs = require('fs');
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema")


module.exports = {
    setComptabilisationLoyer: async (_, res) => {

        // delete data from file if exist
        // fs.writeFile('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt', '', { flag: 'w' }, (error) => {
        //     if (error) throw error
        // })

        //add zeros (0)
        function pad(number, count) {
            return (1e15 + number + '').slice(-count);
        }

        archiveComptabilisation.find()
            .then((data) => {
               
               return res.json(data)

                //ecriture comptable du loyer Sens D
                for (let index = 0; index < data[0].comptabilisation_loyer_debiter.length; index++) {

                    let addTwoNumbersAfterComma = montantLoyer.toFixed(2)
                    let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                    let fullMontant = pad(replacePointWithComma, 9)
                    let ecritureDebiterLoyer = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithDash + ' 00:00:00|' + currentMonthName.toUpperCase() + '-' + today.getFullYear() + '|' + dateWithDash + ' 00:00:00|LOY|PAISOFT|MAD|' + lieuIntitule + ' ' + dateWithSlash + '|01|64200001|NS|' + codeDr + '|' + codePv + '|' + fullMontant + '|D|\n'
                    // Frais Loyer-|GFL -' + (today.getMonth() + 1) + '-' + today.getFullYear() + '||-
                    fs.writeFileSync('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt', ecritureDebiterLoyer, { flag: "a" }, (error) => {
                        if (error) res.json({ message: error.message })
                    })
                }

                //ecriture comptable Sens C 'Montant Net'
                // for (let index = 0; index < data.length; index++) {

                //     let addTwoNumbersAfterComma = montantNet.toFixed(2)
                //     let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                //     let fullMontantNet = pad(replacePointWithComma, 9)
                //     let ecritureCrediterDuMontantNetLoyer = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithDash + ' 00:00:00|' + currentMonthName.toUpperCase() + '-' + today.getFullYear() + '|' + dateWithDash + ' 00:00:00|LOY|PAISOFT|MAD|' + dateWithSlash + ' ' + lieuIntitule + '|01|32700008|NS|NS|NS|' + fullMontantNet + '|C|\n'
                //     // Frais Loyer-' + cinProprietaire + '|GFL -' + (today.getMonth() + 1) + '-' + today.getFullYear() + '||-
                //     fs.writeFileSync('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt', ecritureCrediterDuMontantNetLoyer, { flag: 'a' }, (error) => {
                //         if (error) res.json({ message: error.message })
                //     })
                // }

                //ecriture comptable Sens C 'Tax'
                // for (let index = 0; index < data.length; index++) {

                //     let addTwoNumbersAfterComma = tax.toFixed(2)
                //     let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                //     let fullTax = pad(replacePointWithComma, 9)

                //     let ecritureCrediterDuTaxLoyer = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithDash + ' 00:00:00|' + currentMonthName.toUpperCase() + '-' + today.getFullYear() + '|' + dateWithDash + ' 00:00:00|LOY|PAISOFT|MAD|' + dateWithSlash + '/' + lieuIntitule + '|01|32100007|NS|NS|NS|' + fullTax + '|C|\n'
                //     //Frais Loyer-' + cinProprietaire + '|GFL -' + (today.getMonth() + 1) + '-' + today.getFullYear() + '||-

                //     fs.writeFileSync('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt', ecritureCrediterDuTaxLoyer, { flag: 'a' }, (error) => {
                //         if (error) res.json({ message: error.message })
                //     })
                // }
               
                // res.download('download/FichierComptable ' + currentMonthName + ' ' + today.getFullYear() + '.txt')

            })
            .catch((error) => {
                res.json({ message: error.message })
            })

    }
}
