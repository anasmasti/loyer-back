const Contrat = require('../../models/contrat/contrat.model');


module.exports = {
    supprimerContrat: async (req, res) => {
        
        //chercher si  existe 
        // const numeroContrat = await Contrat.findOne({ numero_contrat: req.params.ID });
        // if (!numeroContrat) {
        //     return res.status(422).send({ message: 'cette contrat n existe pas' });
        // }

            
      

        // remplissage et enregistrement de contrat 
        try{
            //remplissage
             const updatedContrat = await Contrat.updateOne({_id: req.params.ID},{
                deleted: true
             });
             //enregistrement 
             
             res.send(updatedContrat);
        }
        catch(error){
            res.send(error.message);
        }
       


    }
}