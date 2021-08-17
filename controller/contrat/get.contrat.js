const Contrat = require('../../models/contrat/contrat.model');


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
            const allContrat = await Contrat.findOne({_id: req.params.Id});
            res.send(allContrat);
        }catch(error){
            res.send(error.message);
        }
    },

    countContrat: async (req, res) => {
        await Contrat.countDocuments()
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                res.status(400).send({message: error.message})
            })
    }


}