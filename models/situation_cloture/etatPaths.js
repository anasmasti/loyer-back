const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const etatPathsSchema = new Schema({
  etat_paths: [],
  mois: {
    type: Number,
  },
  annee: {
    type: Number,
  },
});

const etatPaths = mongoose.model("etatPaths", etatPathsSchema);

module.exports = etatPaths;
