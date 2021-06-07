const { urlencoded, json } = require('express')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()


const ProprietaireRouter = require('./routes/proprietaire')


const PORT = process.env.PORT
const DB_URL = process.env.DB_URL

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