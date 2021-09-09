const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const db_config = require("./helpers/db.config");
const routes = require("./routes/routes.js");
const checkApiKey = require("./middleware/api-key.verify");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "Hotmail",
  auth: {
    user: "badreazz@hotmail.com",
    pass: "Badisa1983",
  },
  from: "badreazz@hotmail.com",
});

var message = {
  from: "badreazz@hotmail.com",
  to: "anasmasti@hotmail.com",
  subject: "Test title",
  text: "Hello World",
  html: `<!doctype html>
    <html>
      <head>
        Hello Everyone
      </head>
      <body>
       <p> this is just a test message mail from node mailer thank you! </p>
      </body>
    </html>`,
};

// transporter.sendMail(message, (error, info) => {
//     if (err) {
//         return console.log(error.message);
//     } else {
//         console.log(info.messageId);
//     }
// })

// Globale fichier .env configuration
dotenv.config();
const PORT = process.env.PORT;

app.use("/uploads", express.static("./uploads"));

//securing Api with Helmet
app.use(helmet());

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
server.listen(PORT, (err) => {
  if (err) {
    console.log("server error", err.message);
    return;
  } else {
    console.log(`Server listening on http://10.0.2.15:${PORT}`);
  }
});
