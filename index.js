const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const ProprietaireRouter = require('./routes/proprietaire')
const HomeRouter = require('./routes/home')

// Globale fichier .env configuration 
dotenv.config()

const PORT = process.env.PORT
const DB_URL = process.env.DB_URL
const DB_LOCAL = process.env.DB_LOCAL

//use Cors
app.use(cors({
    origin: '*',
    credentials: true,
    methods: [
        'GET', 'POST', 'PUT'
    ],
    allowedHeaders: 'Content-Type, X-Requested-With, Accept, Origin, Authorization'
}))

//
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', HomeRouter)
app.use('/api/proprietaire', ProprietaireRouter)

//Database configuration
mongoose.connect(DB_LOCAL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }, () => console.log('connected to DB'))

//running server
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))