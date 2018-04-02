module.exports = class ReadyListener extends require("discord-akairo").Listener {
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
