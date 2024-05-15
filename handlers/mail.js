const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlined = juice(html);
  return inlined;
};

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.convert(html);
  const mailOptions = {
    from: `Westridge Archive <noreply-archive@westridge.org>`,
    to: options.user,
    subject: options.subject,
    html,
    text
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};

exports.sendAnon = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.convert(html);
  const mailOptions = {
    from: `Westridge Archive <noreply-archive@westridge.org>`,
    bcc: options.user,
    subject: options.subject,
    html,
    text
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};


exports.sendContributionUpdate = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.convert(html);
  const mailOptions = {
    from: `Westridge Archive <noreply-archive@westridge.org>`,
    to: options.user,
    subject: options.subject,
    html,
    text,
    message: options.message,
    status: options.status
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};

exports.sendEditUpdate = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.convert(html);
  console.log("user in send" + options.user);
  const mailOptions = {
    from: `Westridge Archive <noreply-archive@westridge.org>`,
    to: options.user,
    subject: options.subject,
    html,
    text,
    article: options.article
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};

exports.sendBlast = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.convert(html);
  const mailOptions = {
    from: `Westridge Archive <noreply-archive@westridge.org>`,
    bcc: options.user,
    subject: options.subject,
    html,
    text,
    message: options.message
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};

exports.sendInquiry = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.convert(html);
  const mailOptions = {
    from: options.from,
    bcc: options.user,
    subject: options.subject,
    html,
    text,
    message: options.message
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};