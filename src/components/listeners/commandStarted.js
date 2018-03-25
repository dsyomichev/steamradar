const { Listener } = require("discord-akairo");
const logger = require("../base/log");
module.exports = class CommandStartedListener extends Listener {
  constructor() {
    super("commandStarted", {
      emitter: "commandHandler",
      event: "commandStarted"
    });
  }

  exec(msg, cmd, args) {
    logger.debug(`Command Run | ${cmd} [ ${JSON.stringify(args)} ]`);
  }
};