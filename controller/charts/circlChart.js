const Contrat = require('../../models/contrat/contrat.model')

module.exports = {
    CirclChartData: async (_, res) => {
        try {

            let countContratEnCours = await Contrat.countDocuments({ 'etat_contrat.libelle': 'En cours' })
            let countContratSuspendu = await Contrat.countDocuments({ 'etat_contrat.libelle': 'Suspension' })
            let countContratAvenant = await Contrat.countDocuments({ 'etat_contrat.libelle': 'Avenant' })
            let countContratResilie = await Contrat.countDocuments({ 'etat_contrat.libelle': 'Résiliation' })

            let allCirclChartData = [
                {
                    "name": 'Résiliation',
                    "value": countContratResilie,
                    "extra": {
                        "code": 'Rés'
                    }
                },
                {
                    "name": 'En cours',
                    "value": countContratEnCours,
                    "extra": {
                        "code": 'Enc'
                    }
                },
                {
                    "name": 'Avenant',
                    "value": countContratAvenant,
                    "extra": {
                        "code": 'Av'
                    }
                },
                {
                    "name": 'Suspendu',
                    "value": countContratSuspendu,
                    "extra": {
                        "code": 'Sus'
                    }
                }
            ]
            res.json(allCirclChartData)

        } catch (error) {
            throw error
        }


    }
}