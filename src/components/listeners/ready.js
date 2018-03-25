const { Listener } = require("discord-akairo");
const logger = require("../base/log");
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
