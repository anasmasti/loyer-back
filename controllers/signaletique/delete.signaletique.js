const Signaletique = require("../../models/signaletique/signaletique.schema");

const deleteSignaletique = async (req, res) => {
  await Signaletique.findByIdAndUpdate(
    { _id: req.params.Id },
    {
      deleted: true,
    },
    { new: true }
  )
    .then((_) => {
      res.json("Signatétique supprimée avec succès");
    })
    .catch((error) => {
      res.status(403).send({ message: error.message });
    });
};

module.exports = deleteSignaletique;
