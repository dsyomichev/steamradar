const { AkairoClient } = require("discord-akairo");
const rp = require("request-promise");
const tough = require("tough-cookie");

const logger = require("./base/log");

const Provider = require("../../lib/provider");
const SteamAPI = require("../../lib/steamapi");
const SteamQuery = require("../../lib/steamquery");

module.exports = class Client extends AkairoClient {
  async start({ discord, steam }) {
    await this.setSession();
    this.setProvider();
    this.steam(steam);
    this.login(discord);
  }

  async setSession() {
    let res;
    try {
      res = await rp({
        uri: "http://steamcommunity.com",
        method: "GET",
        resolveWithFullResponse: true
      });
    } catch (error) {
      logger.warn("Steam Community is down. Unable to receive session key.");
      this.session = null;
      return;
    }

    let cookiestring = res.headers["set-cookie"][0];
    let sessionid = cookiestring.substring(10, cookiestring.indexOf(";"));
    let cookie = tough.Cookie.parse(cookiestring);
    let jar = rp.jar();
    jar.setCookie(cookie, "http://steamcommunity.com");
    this.session = { id: sessionid, jar: jar };
    return logger.debug("Started Session with Steam Community");
  }

  steam(key) {
    this.steam = new SteamAPI(key);
    this.query = new SteamQuery();
  }

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
