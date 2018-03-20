const { Listener } = require("discord-akairo");
const logger = require("../log");
module.exports = class ReadyListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      eventName: "ready"
    });
  }

  exec() {
    logger.info(`Connected to Discord`);
  }
};
