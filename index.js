const { urlencoded, json } = require('express')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()


const ProprietaireRouter = require('./routes/proprietaire')


const PORT = process.env.PORT
const DB_URL = process.env.DB_URL

//use Cors
app.use(cors({
    origin: '*',
    credentials: true,
    methods: [
        'GET', 'POST', 'PUT', 'DELETE'
    ],
    allowedHeaders: 'Content-Type, X-Requested-With, Accept, Origin, Authorization'
}))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/api/proprietaire', ProprietaireRouter)



mongoose.connect(DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }, () => console.log('connected to DB'))

server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))