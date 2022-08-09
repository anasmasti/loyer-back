const Signaletique = require("../../models/signaletique/signaletique.schema");

const putSignaletique = async (req, res) => {
  let signaletiqueActiveExist = await Signaletique.findOne({
    $and: [
      {
        deleted: false,
        active: true,
      },
      { _id: { $ne: req.params.Id } },
    ],
  });

  if (signaletiqueActiveExist && req.body.active) {
    res.status(409).send({ message: "Une signalétique active déja" });
    return;
  }

  const signaletique = {
    raison_sociale: req.body.raison_sociale,
    if: req.body.if,
    rib: req.body.rib,
    adresse: req.body.adresse,
    active: req.body.active,
  };

  await Signaletique.findByIdAndUpdate({ _id: req.params.Id }, signaletique)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
};

module.exports = putSignaletique;
