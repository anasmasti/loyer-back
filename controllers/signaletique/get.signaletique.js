const Signaletique = require("../../models/signaletique/signaletique.schema");

const getSignaletiques = async (_, res) => {
  await Signaletique.find({ deleted: false })
    .sort({ updatedAt: "desc" })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(403).json({ message: error.message });
    });
};

module.exports = getSignaletiques;
