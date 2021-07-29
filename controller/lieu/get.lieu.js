const Lieu = require('../../models/lieu/lieu.model');


module.exports = {
    getLieux: async (req, res) => {
        
        try {
            const allLieu = await Lieu.find();
            res.send(allLieu);
        } catch (error) {
            res.send(error.message);
        }

    },
    getSelctedLieu: async (req,res) =>{
        try{
            const allLieu = await Lieu.findOne({_id: req.params.ID});
            res.send(allLieu);
        }catch(error){
            res.send(error.message);
        }
    }
}