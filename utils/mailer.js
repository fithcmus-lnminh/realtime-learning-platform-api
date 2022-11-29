const nodeMailer = require("nodemailer");

const mailHost = "smtp.gmail.com";
const mailPort = 587;

const sendMail = (to, subject, htmlContent) => {
  const transporter = nodeMailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: false,
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASSWORD
    }
  });
  const options = {
    from: process.env.MAILER_EMAIL,
    to: to,
    subject: subject,
    html: htmlContent
  };
  return transporter.sendMail(options);
};

module.exports = sendMail;
