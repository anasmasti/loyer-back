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
        user: "attawfiqmf.app@gmail.com",
        pass: "Attawfiq@Gmail_2021",
      },
    });

    var message = {
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
