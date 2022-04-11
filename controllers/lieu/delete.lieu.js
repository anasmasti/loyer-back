const Lieu = require("../../models/lieu/lieu.model");
const Foncier = require("../../models/foncier/foncier.model");

module.exports = {
  deletedLieu: async (req, res) => {
    // await Lieu.find({ attachedDR: req.params.Id }).then((lieux) => {
    //   if (lieux.length > 0) {
        
    //   }
    //   else {
    //     await Foncier.find({  })
    //   }
    // })

    await Lieu.findByIdAndUpdate(
      { _id: req.params.Id },
      {
        deleted: true,
      },
      { new: true }
    )
      .then((data) => {
        res.json("Local supprimé avec succès");
      })
      .catch((error) => {
        res.status(403).send({ message: error.message });
      });
  },
};
