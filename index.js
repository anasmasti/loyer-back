const express = require("express");
const http = require("http");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const db_config = require("./helpers/db.config");
const routes = require("./routes/routes.js");
const checkApiKey = require("./middleware/api-key.verify");
const ip = require("ip");

// Launch app
const app = express();
const server = http.createServer(app);

//get local adress ip
let ipAdress = ip.address();

// Globale fichier .env configuration
dotenv.config();
const PORT = process.env.PORT;

app.use("/uploads", express.static("./uploads"));

//securing Api with Helmet
app.use(helmet.frameguard({ action: "deny"}));
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());

//use Cors
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Authorization",
      "Api-Key-Access",
    ],
  })
);

//data parser as json
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));

//routes configuration
app.use("/api/v1", routes);

//database connection
db_config;

//running server
server.listen(PORT, ipAdress, (error) => {
  if (error) {
    console.log(`Server error: ${error.message}`);
    return;
  } else {
    console.log(
      `Server listening on http://localhost:${PORT} Or http://${ipAdress}:${PORT}`
    );
  }
});
