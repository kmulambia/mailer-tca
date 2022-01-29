"use strict";
require("dotenv").config();
const zmq = require("zeromq");
const winston = require("winston");
const nodemailer = require("nodemailer");
/*loggers*/
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, prettyPrint, colorize } = format;
const logger = createLogger({
  format: combine(timestamp(), prettyPrint(), colorize()),
  transports: [
    new transports.Console(),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "service.log",
      level: "info",
    }),
    new winston.transports.File({
      filename: "debug.log",
      level: "debug",
    }),
  ],
});
/***/
// mailer config
const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
});
// socket
var socket = zmq.socket("pull");
// helper function nodemailer
async function send(message) {
  await transporter.sendMail(
    {
      from: process.env.MAILER_FROM,
      to: message.recipient,
      subject: message.subject,
      html: message.body, // html body
    },
    (error, response) => {
      if (error) {
        // error
        logger.log({
          level: "error",
          label: "EMAIL_FAILED",
          message: error.message,
        });
        /*for debugging purposes only*/
        logger.log({
          level: "debug",
          label: "EMAIL_FAILED",
          message: error,
        });
        /***/
      } else {
        // success
        logger.log({
          level: "info",
          label: "EMAIL_SENT",
          message: response,
        });
      }
    }
  );
}
// Add a callback for the event that is invoked when we receive a message.
socket.on("message", (msg) => {
  // send message
  try {
    var mail = JSON.parse(msg);
    logger.log({
      level: "info",
      label: "REQUEST_RECIEVED",
      message: "Subject : " + mail.subject,
    });
    /*process*/
    send(mail);
  } catch (error) {
    throw error;
  }
});

// Connect to the server instance.
try {
  socket.connect(process.env.ZEROMQ_SOCKET);
  // connection success
  logger.log({
    level: "info",
    label: "CONNECTION_OK",
    message: "service started on " + process.env.ZEROMQ_SOCKET,
  });
} catch (error) {
  logger.log({
    level: "error",
    label: "CONNECTION_FAILED",
    message: error.message,
  });
  /*for debugging purposes only*/
  logger.log({
    level: "debug",
    label: "CONNECTION_FAILED",
    message: error,
  });
  /***/
}
