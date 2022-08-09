const Signaletique = require("../../models/signaletique/signaletique.schema");

const postSignaletique = async (req, res) => {
  let signaletiqueActiveExist = await Signaletique.findOne({
    deleted: false,
    active: true,
  });

  if (signaletiqueActiveExist && req.body.active) {
    res.status(409).send({ message: "Une signalétique active déja" });
    return;
  }

  const signaletique = new Signaletique({
    raison_sociale: req.body.raison_sociale,
    if: req.body.if,
    rib: req.body.rib,
    adresse: req.body.adresse,
    active: req.body.active,
  });

  await signaletique
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
};

module.exports = postSignaletique;
