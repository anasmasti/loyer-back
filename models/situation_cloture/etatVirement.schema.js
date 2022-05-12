const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const etatVirementSchema = new Schema(
  {
    ordre_virement: [],
    date_generation_de_virement: {
      type: Date,
    },
    mois: {
      type: Number,
    },
    annee: {
      type: Number,
    },
  },
  { timestamps: true }
);

const etatVirement = mongoose.model("etatVirement", etatVirementSchema);

module.exports = etatVirement;
