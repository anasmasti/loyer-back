const Contrat = require('../../models/contrat/contrat.model')



module.exports = {
    allNotifications: (arg) => {

        let notificationCount = 0
        return async (_, res) => {
            
            let todayDate = new Date(), allNotifications = [];

            await Contrat.find({ deleted: false, 'etat_contrat.libelle': 'Résilié', 'etat_contrat.etat.date_resiliation': { $lte: todayDate } }).sort({ 'updatedAt': -1 })
            .then(async (data) => {
                    for (const i in data) {
                        if (data[i].etat_contrat.etat.reprise_caution == 'Récupérée') {
                            allNotifications.push({
                                message: 'Vous avez ' + data[i].duree_caution + ' mois de caution à restituer pour le contrat numéro ' + data[i].numero_contrat,
                                created_at: todayDate,
                            })
                            notificationCount += 1;

                        } else if (data[i].etat_contrat.etat.reprise_caution == 'Consommée' && data[i].etat_contrat.etat.etat_caution_consomme == 'Partial') {
                            allNotifications.push({
                                message: 'Vous avez ' + data[i].etat_contrat.etat.duree_a_recupere + ' mois de caution à restituer pour le contrat numéro ' + data[i].numero_contrat,
                                created_at: todayDate,
                            })
                            notificationCount += 1;
                        }
                    }
                    if (arg == "all") {
                        res.json(allNotifications);
                    } else if (arg == "count") {
                        res.json(notificationCount);
                        notificationCount = 0
                    }
                })
                .catch((error) => {
                    res.status(402).json({ message: error.message });
                })
        }
    },
    latestNotifications: async (_, res) => {
        let todayDate = new Date(), latestNotifications = [];


        await Contrat.find({ deleted: false, 'etat_contrat.libelle': 'Résilié', 'etat_contrat.etat.date_resiliation': { $lte: todayDate } }).sort({ 'updatedAt': -1 }).limit(3)
            .then(async (data) => {

                for (const i in data) {
                    if (data[i].etat_contrat.etat.reprise_caution == 'Récupérée') {
                        latestNotifications.push({
                            message: 'Vous avez ' + data[i].duree_caution + ' mois de caution à restituer pour le contrat numéro ' + data[i].numero_contrat,
                            created_at: todayDate,
                        })

                    } else if (data[i].etat_contrat.etat.reprise_caution == 'Consommée' && data[i].etat_contrat.etat.etat_caution_consomme == 'Partial') {
                        latestNotifications.push({
                            message: 'Vous avez ' + data[i].etat_contrat.etat.duree_a_recupere + ' mois de caution à restituer pour le contrat numéro ' + data[i].numero_contrat,
                            created_at: todayDate,
                        })
                    }
                }
                res.json(latestNotifications);
            })
            .catch((error) => {
                res.status(402).json({ message: error.message });
            })
    },
}



