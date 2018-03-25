const winston = require("winston");
const path = require("path");
const fs = require("fs");
const ts = () => new Date().toLocaleTimeString();

logs = process.env.DEV == "production" ? false : true;

class Logger extends winston.Logger {
  constructor(cons, dir) {
    if (typeof cons != "boolean")
      throw new Error(
        "Invalid input to log to console. Needs to be a boolean."
      );
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
    if (cons)
      transports.push(
        new winston.transports.Console({
          colorize: true,
          level: "silly"
        })
      );
    super({
      transports: transports
    });
  }
}

module.exports = new Logger(logs, path.join(__dirname, "../../../logs"));
