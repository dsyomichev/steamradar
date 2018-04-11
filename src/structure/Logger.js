const winston = require("winston");
const path = require("path");
const fs = require("fs");
module.exports = class Logger extends winston.Logger {
  constructor(dir) {
    fs.existsSync(dir) || fs.mkdirSync(dir);
    const ts = () => new Date().toLocaleTimeString();
    super({
      transports: [
        new winston.transports.File({
          name: "error",
          filename: path.join(dir, "error.log"),
          level: "error",
          timestamp: ts
        }),
        new winston.transports.File({
          name: "main",
          filename: path.join(dir, "combined.log"),
          level: "silly",
          timestamp: ts
        }),
        new winston.transports.Console({
          colorize: true,
          level: "silly"
        })
      ]
    });
  }
};
