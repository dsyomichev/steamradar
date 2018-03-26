const { AkairoClient } = require("discord-akairo");
const rp = require("request-promise");
const tough = require("tough-cookie");
const fs = require("fs");
const path = require("path");
const rls = require("readline-sync");
const Provider = require("../../lib/RethinkProvider");
const SteamUtil = require("./SteamUtil");
const Logger = require("./Logger");

module.exports = class Client extends AkairoClient {
  async start() {
    this.logger = new Logger(path.join(__dirname, "../../logs"));
    let dir = path.join(__dirname, "../../resource/config/");
    if (fs.existsSync(path.join(dir, "keys.json")) == false) {
      discord = rls.question("     >> Discord Token: ", {
        hideEchoBack: true
      });
      steam = rls.question("     >> Steam Key: ", {
        hideEchoBack: true
      });
      let lists = {};
      lists.dbl = rls.question("     >> DBL Token: ", {
        hideEchoBack: true
      });
      lists.bpw = rls.question("     >> BPW Token: ", {
        hideEchoBack: true
      });
      fs.writeFileSync(
        path.join(dir, "keys.json"),
        JSON.stringify({
          discord: discord,
          steam: steam,
          lists: lists
        })
      );
    }

    let keys = require(path.join(dir, "keys.json"));
    let config = require("../../resource/config/config");
    this.prefix = config.settings.prefix;
    this.location = config.settings.location;
    this.version = config.settings.version;

    await this.setSession();
    this.setProvider();
    this.steam(keys.steam);
    this.login(keys.discord);
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
      this.logger.warn(
        "Steam Community is down. Unable to receive session key."
      );
      this.session = null;
      return;
    }

    let cookiestring = res.headers["set-cookie"][0];
    let sessionid = cookiestring.substring(10, cookiestring.indexOf(";"));
    let cookie = tough.Cookie.parse(cookiestring);
    let jar = rp.jar();
    jar.setCookie(cookie, "http://steamcommunity.com");
    this.session = { id: sessionid, jar: jar };
    return this.logger.debug("Started Session with Steam Community");
  }

  steam(key) {
    this.steam = new SteamUtil({
      key: key,
      sessionid: this.session.id,
      jar: this.session.jar
    });
  }

  async setProvider(host = "localhost", port = 28015) {
    this.provider = new Provider(host, port);
    if (this.readyTimestamp) {
      this.logger.debug(`Provider set to ${this.provider.constructor.name}`);
      try {
        await this.provider.init();
      } catch (err) {
        this.logger.error(err);
        return;
      }
      this.logger.debug("Provider Initialized");
      return;
    }
    this.logger.debug(`Provider set to ${this.provider.constructor.name}`);
    await new Promise(resolve => {
      this.once("ready", () => {
        this.logger.debug(`Initialising Provider`);
        resolve(this.provider.init());
      });
    });
  }
};
