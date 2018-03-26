const winston = require("winston");
const path = require("path");
const fs = require("fs");
const ts = () => new Date().toLocaleTimeString();

module.exports = class Logger extends winston.Logger {
  constructor(dir) {
    if (!dir || !fs.existsSync(dir))
      throw new Error(
        "Invalid log directory, no input or does not exist. Needs to be a valid path."
      );
    let transports = [
      new winston.transports.File({
        name: "error",
        filename: path.join(dir, "errors.log"),
        level: "error",
        timestamp: ts
      }),
      new winston.transports.File({
        name: "main",
        filename: path.join(dir, "main.log"),
        level: "silly",
        timestamp: ts
      })
    ];
    if (process.env.DEV == "production" ? false : true) {
      transports.push(
        new winston.transports.Console({
          colorize: true,
          level: "silly"
        })
      );
    }
    super({
      transports: transports
    });
  }
};
