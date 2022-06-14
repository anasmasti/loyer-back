const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");

const getTraitementDate = async (req, res) => {
  let nextCloture;
  await archiveComptabilisation
    .find()
    .sort({ date_generation_de_comptabilisation: "desc" })
    .select({ date_generation_de_comptabilisation: 1 })
    .then(async (Comptabilisationdata) => {
      nextCloture = new Date(
        Comptabilisationdata[0].date_generation_de_comptabilisation
      );
    })
    .catch((error) => {
      res.status(402).send({
        message: `Erreur de generation de date de traitement : ${error.message}`,
      });
    });
  return nextCloture;
};

module.exports = getTraitementDate;
