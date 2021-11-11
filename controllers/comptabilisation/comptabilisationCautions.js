const fs = require('fs')
const archiveComptabilisation = require("../../models/archive/archiveComptabilisationLoyer.schema")

module.exports = {
    setComptabilisationCautions: async (_, res) => {

        //set date de virement
        let today = new Date();
        let currentMonthName = today.toLocaleString('default', { month: 'long' })
        let dateWithSlash = '01' + '/' + ('0' + (today.getMonth() + 1)).slice(-2) + '/' + today.getFullYear();
        let dateWithDash = today.getFullYear() + '-' + ('0' + + (today.getMonth() + 1)).slice(-2) + '-' + '01';

        //delete data from file if exist
        fs.writeFile('download/FichierComptableCaution ' + currentMonthName + ' ' + today.getFullYear() + '.txt', '', { flag: 'w' }, (error) => {
            if (error) throw error
        })

        //add zeros (0)
        function pad(number, count) {
            return (1e15 + number + '').slice(-count);
        }

        Contrat.find().populate('lieu').populate('foncier').populate({ path: 'foncier', populate: { path: 'proprietaire' } })
            .then((data) => {
                
                let lieuIntitule = "";

                for (let index = 0; index < data.length; index++) {

                    lieuIntitule = data[index].lieu.intitule_lieu

                    let montantCaution = parseInt(data[index].montant_caution)

                    
                    // montantCaution = montantCaution === (NaN || null )? montantCaution = 0 : montantCaution

                    let addTwoNumbersAfterComma = montantCaution.toFixed(2)
                    let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                    let fullMontant = pad(replacePointWithComma, 9)

                    let ecritureDebiterCaution = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithSlash + ' 00:00:00|' + currentMonthName.toUpperCase() + '-' + today.getFullYear() + '|' + dateWithSlash + ' 00:00:00|LOY|PAISOFT|MAD|' + lieuIntitule + '/' + dateWithSlash + '|01|31500003|-|NS|NS|NS|-|-|-|-|-|-|-|-|' + fullMontant + '|D|-\n'

                    fs.writeFileSync('download/FichierComptableCaution ' + currentMonthName + ' ' + today.getFullYear() + '.txt', ecritureDebiterCaution, { flag: "a" }, (error) => {
                        if (error) res.json({ message: error.message })
                    })
                }

                for (let index = 0; index < data.length; index++) {

                    lieuIntitule = data[index].lieu.intitule_lieu

                    let montantCaution = parseInt(data[index].montant_caution)

                    // montantCaution = montantCaution === (NaN || null) ? montantCaution = 0 : montantCaution

                    let addTwoNumbersAfterComma = montantCaution.toFixed(2)
                    let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                    let fullMontant = pad(replacePointWithComma, 9)

                    let ecritureDebiterCaution = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithSlash + ' 00:00:00|' + currentMonthName.toUpperCase() + '-' + today.getFullYear() + '|' + dateWithSlash + ' 00:00:00|LOY|PAISOFT|MAD|' + lieuIntitule + '/' + dateWithSlash + '|01|10200000|-|NS|NS|NS|-|-|-|-|-|-|-|-|' + fullMontant + '|C|-\n'

                    fs.writeFileSync('download/FichierComptableCaution ' + currentMonthName + ' ' + today.getFullYear() + '.txt', ecritureDebiterCaution, { flag: "a" }, (error) => {
                        if (error) res.json({ message: error.message })
                    })
                }

                res.download('download/FichierComptableCaution ' + currentMonthName + ' ' + today.getFullYear() + '.txt')
            })
    }

}