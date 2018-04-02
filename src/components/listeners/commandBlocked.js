module.exports = class CommandBlockedListener extends require("discord-akairo").Listener {
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
