const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Globale fichier .env configuration
dotenv.config();

const DB_URL = process.env.DB_URL;
const DB_LOCAL = process.env.DB_CLOUD;

//Database configuration
const db_config = mongoose.connect(
  DB_LOCAL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (error) => {
    if (error) {
      console.log("database error", error.message);
      return;
    } else {
      console.log("connected to DB");
    }
  }
);

module.exports = db_config;
