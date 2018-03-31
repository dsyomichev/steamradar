const { Listener } = require("discord-akairo");
module.exports = class ReadyListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      eventName: "ready"
    });
  }

  exec() {
    this.client.log.info(`Connected to Discord`);
  }
};
