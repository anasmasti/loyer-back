const Contrat = require('../../models/contrat/contrat.schema');


module.exports = {
    getContrats: async (req, res) => {
        
        try {
            const allContrat = await Contrat.find();
            res.send(allContrat);
        } catch (error) {
            res.send(error.message);
        }

    }
}