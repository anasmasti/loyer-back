const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const helmet = require('helmet')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const db_config = require('./helpers/db.config')
const routes = require('./routes/routes.js')
const checkApiKey = require('./middleware/api-key.verify')


// Globale fichier .env configuration 
dotenv.config()
const PORT = process.env.PORT

//securing Api with Helmet
app.use(helmet())

//use Cors
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'X-Requested-With', 'Accept', 'Origin', 'Authorization', 'Api-Key-Access'],
}))

//data parser as json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//routes configuration
app.use('/api/v1', checkApiKey ,routes);

//database connection
db_config;



//running server
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))