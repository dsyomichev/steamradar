const { Listener } = require("discord-akairo");
module.exports = class CommandBlockedListener extends Listener {
  constructor() {
    super("commandBlocked", {
      emitter: "commandHandler",
      event: "commandBlocked"
    });
  }

  exec(msg, cmd, reason) {
    this.client.log.debug(`Command Blocked | ${cmd} [ ${reason} ]`);
  }
};
