const { AkairoClient } = require("discord-akairo");
const logger = require("./log");
const Provider = require("../../lib/provider");
module.exports = class Client extends AkairoClient {
  async setProvider(host = "localhost", port = 28015) {
    this.provider = new Provider(host, port);
    if (this.readyTimestamp) {
      logger.debug(`Provider set to ${this.provider.constructor.name}`);
      try {
        await this.provider.init();
      } catch (err) {
        logger.error(err);
        return;
      }
      logger.debug("Provider Initialized");
      return;
    }
    logger.debug(`Provider set to ${this.provider.constructor.name}`);
    await new Promise(resolve => {
      this.once("ready", () => {
        logger.debug(`Initialising Provider`);
        resolve(this.provider.init());
      });
    });
  }
};
