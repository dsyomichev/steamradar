module.exports = class CommandStartedListener extends require("discord-akairo").Listener {
  constructor() {
    super("commandStarted", {
      emitter: "commandHandler",
      event: "commandStarted"
    });
  }

  exec(msg, cmd, args) {
    this.client.log.debug(`Command Run | ${cmd} [ ${JSON.stringify(args)} ]`);
  }
};
