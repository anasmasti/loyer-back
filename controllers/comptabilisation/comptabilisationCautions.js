const fs = require('fs')
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema")

module.exports = {
    genererComptabilisationCautions: async (req, res) => {

        //add zeros (0)
        function pad(number, count) {
            return (1e15 + number + '').slice(-count);
        }

        archiveComptabilisation.findOne({ mois: req.params.mois, annee: req.params.annee })
            .then((data) => {
                // return  res.json(data)

                //traitement du date
                let dateGenerationVirement = data.date_generation_de_comptabilisation
                let dateWithSlash = '01' + '/' + ('0' + (dateGenerationVirement.getMonth() + 1)).slice(-2) + '/' + dateGenerationVirement.getFullYear();
                let dateMonthName = dateGenerationVirement.toLocaleString('default', { month: 'long' })

                //delete data from file if exist
                fs.writeFile('download/FichierComptableCaution ' + dateMonthName + ' ' + dateGenerationVirement.getFullYear() + '.txt', '', { flag: 'w' }, (error) => {
                    if (error) throw error
                })

                //traitement de comptabilisation caution sens Debiter
                for (let i = 0; i < data.comptabilisation_loyer_debiter.length; i++) {

                    let lieuIntitule = data.comptabilisation_loyer_debiter[i].intitule_lieu

                    let montantCaution = data.comptabilisation_loyer_debiter[i].montant_caution
                    let addTwoNumbersAfterComma = montantCaution.toFixed(2)
                    let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                    let fullMontant = pad(replacePointWithComma, 9)

                    let ecritureDebiterCaution = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithSlash + ' 00:00:00|' + dateMonthName.toUpperCase() + '-' + dateGenerationVirement.getFullYear() + '|' + dateWithSlash + ' 00:00:00|LOY|PAISOFT|MAD|' + lieuIntitule + '/' + dateWithSlash + '|01|31500003|-|NS|NS|NS|-|-|-|-|-|-|-|-|' + fullMontant + '|D|-\n'

                    fs.writeFileSync('download/FichierComptableCaution ' + dateMonthName + ' ' + dateGenerationVirement.getFullYear() + '.txt', ecritureDebiterCaution, { flag: "a" }, (error) => {
                        if (error) res.json({ message: error.message })
                    })
                }

                //traitement de comptabilisation caution sens Crediter
                for (let i = 0; i < data.comptabilisation_loyer_debiter.length; i++) {

                    let lieuIntitule = data.comptabilisation_loyer_debiter[i].intitule_lieu

                    let montantCaution = data.comptabilisation_loyer_debiter[i].montant_caution
                    let addTwoNumbersAfterComma = montantCaution.toFixed(2)
                    let replacePointWithComma = addTwoNumbersAfterComma.replace('.', ',')
                    let fullMontant = pad(replacePointWithComma, 9)

                    let ecritureDebiterCaution = 'FRAIS DE LOYER DU ' + dateWithSlash + '|' + dateWithSlash + ' 00:00:00|' + dateMonthName.toUpperCase() + '-' + dateGenerationVirement.getFullYear() + '|' + dateWithSlash + ' 00:00:00|LOY|PAISOFT|MAD|' + lieuIntitule + '/' + dateWithSlash + '|01|10200000|-|NS|NS|NS|-|-|-|-|-|-|-|-|' + fullMontant + '|C|-\n'

                    fs.writeFileSync('download/FichierComptableCaution ' + dateMonthName + ' ' + dateGenerationVirement.getFullYear() + '.txt', ecritureDebiterCaution, { flag: "a" }, (error) => {
                        if (error) res.json({ message: error.message })
                    })
                }

                res.download('download/FichierComptableCaution ' + dateMonthName + ' ' + dateGenerationVirement.getFullYear() + '.txt')
            })
    }

}