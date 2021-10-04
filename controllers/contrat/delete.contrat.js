const Contrat = require('../../models/contrat/contrat.model');


module.exports = {
    supprimerContrat: async (req, res) => {
        // remplissage et enregistrement de contrat 
        try{
            //remplissage
             const updatedContrat = await Contrat.findByIdAndUpdate({_id: req.params.Id},{deleted: true}, {new:true});
             //enregistrement 
             res.json(updatedContrat);
        }
        catch(error){
            res.status(401).send({message: error.message});
        }
       


    }
}