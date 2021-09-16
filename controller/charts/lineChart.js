const Contrat = require('../../models/contrat/contrat.model');

module.exports = {
    lineChartData: async (_, res) => {
        try {
            let typeLieu = ['Point de vente', 'Supervision', 'Logement de fonction', 'Direction régionale', 'Siège']
            let series = [], allLineChartData = []

            let allPointDeVente = await Contrat.find({ type_lieu: 'Point de vente' }, {}, { sort: { 'createdAt': -1 } }).limit(6)
            let allSupervision = await Contrat.find({ type_lieu: 'Supervision' }, {}, { sort: { 'createdAt': -1 } }).limit(6) 
            let allLogementDeFonction = await Contrat.find({ type_lieu: 'Logement de fonction' }, {}, { sort: { 'createdAt': -1 } }).limit(6)
            let allDirectionRegional = await Contrat.find({ type_lieu: 'Direction régionale' }, {}, { sort: { 'createdAt': -1 } }).limit(6)
            let allSiege = await Contrat.find({ type_lieu: 'Siège' }, {}, { sort: { 'createdAt': -1 } }).limit(6)
            


            typeLieu.forEach(element => {
                for (let i = 1; i < 6; i++) {
                    series.push({
                        "value": element == 'Point de vente' ? allPointDeVente[i].montant_loyer
                            : element == 'Supervision' ? allSupervision[i].montant_loyer
                                : element == 'Logement de fonction' ? allLogementDeFonction[i].montant_loyer
                                    : element == 'Direction régionale' ? allDirectionRegional[i].montant_loyer
                                        : element == 'Siège' ? allSiege[i].montant_loyer : '',

                        "name": element == 'Point de vente' ? allPointDeVente[i].createdAt
                            : element == 'Supervision' ? allSupervision[i].createdAt
                                : element == 'Logement de fonction' ? allLogementDeFonction[i].createdAt
                                    : element == 'Direction régionale' ? allDirectionRegional[i].createdAt
                                        : element == 'Siège' ? allSiege[i].createdAt : '',
                    })
                }
                allLineChartData.push({
                    "name": element,
                    "series": series
                })
                series = []
            });

            res.json(allLineChartData)
        } catch (error) {
            res.status(402).send({ message: error.message })
        }

    }
}