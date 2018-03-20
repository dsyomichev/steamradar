const { Listener } = require("discord-akairo");
const logger = require("../log");
module.exports = class ErrorListener extends Listener {
  constructor() {
    super("error", {
      emitter: "commandHandler",
      event: "error"
    });
  }

  exec(err, msg, cmd) {
    logger.error(`Command Error | ${err} [ ${cmd} ]`);
  }
};
