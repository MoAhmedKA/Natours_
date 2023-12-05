/* disable-eslint */
const pug = require('pug');
const nodemailer = require('nodemailer');
const html2Text = require('html-to-text');

module.exports = class email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Momen Ahmed <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'Brevo',
        auth: {
          user: process.env.SENDINBLUE_LOGIN,
          pass: process.env.SENDINBLUE_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      pass: process.env.EMAIL_PORT,

      auth: {
        user: process.env.EMAIL_USERNAME,

        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: html2Text.convert(html)
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password reset Token(vaild for only 10m)'
    );
  }
};
