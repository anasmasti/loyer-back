const nodemailer = require('nodemailer')

module.exports = {
    sendMail: async (req, res) =>{
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
          
          transporter.sendMail(message, (error, info) => {
              if (error) {
                  return console.log(error.message);
              } else {
                  console.log(info.messageId);
              }
          })
    }
}