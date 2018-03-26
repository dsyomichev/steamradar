const { Listener } = require("discord-akairo");
module.exports = class CommandStartedListener extends Listener {
  constructor() {
    super("commandStarted", {
      emitter: "commandHandler",
      event: "commandStarted"
    });
  }

  exec(msg, cmd, args) {
    this.client.logger.debug(`Command Run | ${cmd} [ ${JSON.stringify(args)} ]`);
  }
};