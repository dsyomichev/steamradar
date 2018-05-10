const path = require("path");
const rp = require("request-promise");

const Provider = require(path.resolve("lib/RethinkProvider"));
const SteamUtil = require(path.resolve("src/structure/SteamUtil"));
const Logger = require(path.resolve("src/structure/Logger"));

const { AkairoClient, InhibitorHandler, ListenerHandler } = require("discord-akairo");
const CommandHandler = require(path.resolve("src/structure/CommandHandler"));

module.exports = class Client extends AkairoClient {
  constructor(options = {}, clientOptions) {
    super(options, clientOptions);
    let { logDirectory, configDirectory, dataDirectory } = options;
    this.log = new Logger(logDirectory);
    this.configDirectory = configDirectory;
    this.dataDirectory = dataDirectory;
    let { version, defaults, invite, server, upvote, dev } = require(path.join(this.configDirectory, "settings"));
    this.data = { cc: require(path.join(this.dataDirectory, "countries")), cur: require(path.join(this.dataDirectory, "currency")) };

    this.version = version;
    this.defaults = defaults;
    this.invite = invite;
    this.upvote = upvote;
    this.server = server;
    this.dev = dev;
  }

  build() {
    if (this._built) {
      throw new AkairoError("BUILD_ONCE");
    }

    this._built = true;

    if (this.akairoOptions.commandDirectory && !this.commandHandler) {
      /**
       * The command handler.
       * @type {CommandHandler}
       */
      this.commandHandler = new CommandHandler(this);
    }

    if (this.akairoOptions.inhibitorDirectory && !this.inhibitorHandler) {
      /**
       * The inhibitor handler.
       * @type {InhibitorHandler}
       */
      this.inhibitorHandler = new InhibitorHandler(this);
    }

    if (this.akairoOptions.listenerDirectory && !this.listenerHandler) {
      /**
       * The listener handler.
       * @type {ListenerHandler}
       */
      this.listenerHandler = new ListenerHandler(this);
    }

    return this;
  }

  async start({ discord, steam, site, lists }) {
    this.lists = lists;
    this.site_token = site;
    this.startSession(steam);
    this.setProvider();
    await this.login(discord);
  }

  async startSession(key) {
    this.steam = new SteamUtil({ key });
    if (this.readyTimestamp) {
      try {
        await this.steam.init();
      } catch (err) {
        return this.log.error(err);
      }
      return this.log.debug("Steam Utils Initialized");
    }
    return await new Promise(resolve => {
      this.once("ready", () => {
        this.log.debug("Initializing Steam Utils");
        return resolve(this.steam.init());
      });
    });
  }

  async setProvider(host = "localhost", port = 28015) {
    this.provider = new Provider({ db: "steamradar", tables: ["user", "guild"] });
    if (this.readyTimestamp) {
      this.log.debug(`Provider set to ${this.provider.constructor.name}`);
      try {
        await this.provider.init();
      } catch (err) {
        return this.log.error(err);
      }
      return this.log.debug("Provider Initialized");
    }
    this.log.debug(`Provider set to ${this.provider.constructor.name}`);
    return await new Promise(resolve => {
      this.once("ready", () => {
        this.log.debug(`Initializing Provider`);
        resolve(this.provider.init());
      });
    });
  }

  async postGuilds() {
    if (this.dev) return;

    await rp({
      method: "POST",
      uri: `https://discordbots.org/api/bots/${this.user.id}/stats`,
      headers: { Authorization: this.lists.dbl },
      body: { server_count: this.guilds.size },
      json: true
    }).then(() => this.debug("Updated DBL guild count."), () => this.log.warn("Unable to update DBL guild count."));

    await rp({
      method: "POST",
      uri: `https://bots.discord.pw/api/bots/${this.user.id}/stats`,
      headers: { Authorization: this.lists.bpw },
      body: { server_count: this.guilds.size },
      json: true
    }).then(() => this.log.debug("Updated BPW guild count."), () => this.log.warn("Unable to update BPW guild count."));

    await rp({
      method: "POST",
      uri: `https://botlist.space/api/api/bots/${this.user.id}`,
      headers: { Authorization: this.lists.bds },
      body: { server_count: this.guilds.size },
      json: true
    }).then(() => this.log.debug("Updated BDS guild count."), () => this.log.warn("Unable to update BDS guild count."));

    await rp({
      method: "POST",
      uri: `https://botsfordiscord.com/api/v1/bots/${this.user.id}`,
      headers: { Authorization: this.lists.bfd },
      body: { server_count: this.guilds.size },
      json: true
    }).then(() => this.log.debug("Updated BFD guild count."), () => this.log.warn("Unable to update BFD guild count."));

    return;
  }
};
