const { Listener } = require("discord-akairo");
const logger = require("../log");
module.exports = class CommandBlockedListener extends Listener {
  constructor() {
    super("commandBlocked", {
      emitter: "commandHandler",
      event: "commandBlocked"
    });
  }

  exec(msg, cmd, reason) {
    logger.debug(`Command Blocked | ${cmd} [ ${reason} ]`);
  }
};
