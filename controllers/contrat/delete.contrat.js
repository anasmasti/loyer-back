const Contrat = require('../../models/contrat/contrat.model');
const Lieu = require('../../models/lieu/lieu.model')


module.exports = {
    supprimerContrat: async (req, res) => {
        // remplissage et enregistrement de contrat 
        try{

            //find requested contrat
            let findContrat = await Contrat.findById({_id:req.params.Id, deleted: false})

            //
            await Lieu.findByIdAndUpdate({_id: findContrat.lieu}, {has_contrat: false})

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