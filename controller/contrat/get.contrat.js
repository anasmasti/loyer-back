const Contrat = require('../../models/contrat/contrat.schema');


module.exports = {
    getContrats: async (req, res) => {
        
        try {
            const allContrat = await Contrat.find({ deleted: false });
            res.send(allContrat);
        } catch (error) {
            res.send(error.message);
        }

    },
    getSelctedContrat: async (req,res) =>{
        try{
            const allContrat = await Contrat.findOne({_id: req.params.ID});
            res.send(allContrat);
        }catch(error){
            res.send(error.message);
        }
    }


}