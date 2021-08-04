const mongoose = require('mongoose')
const dotenv = require('dotenv')


// Globale fichier .env configuration 
dotenv.config()

const DB_URL = process.env.DB_URL
const DB_LOCAL = process.env.DB_LOCAL


//Database configuration
const db_config = mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}, () => console.log('connected to DB'))

module.exports = db_config;