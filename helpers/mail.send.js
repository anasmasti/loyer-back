const nodemailer = require("nodemailer");
const fs = require("fs");
const Handlebars = require("handlebars");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

module.exports = {
  sendMail: async (to, subject, fileName, data) => {
    var fileSource = await readFile(
      `./templates/mails/${fileName}.html`,
      "utf8"
    );
    var template = Handlebars.compile(fileSource);
    var htmlToSend = template(data)

    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "yassine.19am49@gmail.com",
        pass: "Yassine@Gmail2_2021",
        // user: "mediexpertsapp@gmail.com",
        // pass: "Mediexperts2021",
      },
      from: "help@capitalsoft.com",
    });

    var message = {
      from: "help@capitalsoft.com",
      to: to,
      subject: subject,
      html: htmlToSend,
    };

    await transporter.sendMail(message, (error, info) => {
      if (error) {
        return console.log("Can't send mail", error.message);
      } else {
        console.log(info.messageId);
      }
    });
  },
};
