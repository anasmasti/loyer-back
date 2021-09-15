const Contrat = require('../../models/contrat/contrat.model')

module.exports = {
    CirclChartData: async (_,res) => {
        let countContratEnCours = await Contrat.countDocuments({'etat_contrat.libelle':'En cours'})
        let countContratSuspendu = await Contrat.countDocuments({})
        let countContratAvenant = await Contrat.countDocuments({})
        let countContratResilie = await Contrat.countDocuments({})
        let allCirclChartData = [
            {
                "name": '',
                "value": '',
                "extra": {
                    "code":''
                }
            },
            {
                "name": '',
                "value": '',
                "extra": {
                    "code":''
                }
            },
            {
                "name": '',
                "value": '',
                "extra": {
                    "code":''
                }
            },
            {
                "name": '',
                "value": '',
                "extra": {
                    "code":''
                }
            }
        ]

       
    }
}