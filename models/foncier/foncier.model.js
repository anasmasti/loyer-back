const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fileSchema = require("../shared/file.schema");
const amenagementSchema = require("./amenagement.schema");

const foncierSchema = new Schema(
  {
    adresse: {
      type: String,
    },
    ville: {
      type: String,
    },
    proprietaire: [
      {
        type: Schema.Types.ObjectId,
        ref: "Proprietaire",
      },
    ],
    lieu: [
      {
        id_lieu: {
          type: Schema.Types.ObjectId,
          ref: "Lieu",
        },
        deleted: {
          type: Boolean,
          default: false,
        },
        transferer: {
          type: Boolean,
          default: false,
        },
      },
    ],
    desc_lieu_entrer: {
      type: String,
    },
    imgs_lieu_entrer: {
      type: [fileSchema],
    },
    has_amenagements: {
      type: Boolean,
      default: false,
    },
    superficie: {
      type: String,
    },
    etage: {
      type: String,
    },
    type_lieu: {
      type: String,
    },
    amenagement: {
      type: [amenagementSchema],
    },
    has_contrat: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Foncier = mongoose.model("Foncier", foncierSchema);
module.exports = Foncier;
