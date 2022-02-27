const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const etatTaxesSchema = new Schema(
  {
    comptabilisation_loyer_crediter: [],
    comptabilisation_loyer_debiter: [],
    date_generation_de_comptabilisation: {
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

const etatTaxes = mongoose.model("etatTaxes", etatTaxesSchema);

module.exports = etatTaxes;
