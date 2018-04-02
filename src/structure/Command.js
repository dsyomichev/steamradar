const path = require("path");
module.exports = class Command extends require("discord-akairo").Command {
  constructor(id, options = {}) {
    let { format = "", examples = [], details = "", api = false, upvote = false, patreon = false } = options;
    if (api) {
      options.cooldown = 10000;
      options.ratelimit = 1;
    }

    super(id, options);
    this.format = format;
    this.examples = examples;
    this.details = details;
    this.api = Boolean(api);
    this.upvote = Boolean(upvote);
    this.patreon = Boolean(patreon);
  }

  normalizeCC(location) {
    let country = this.client.data.cc[location];
    if (!country) return;
    return country.indexOf(":") != -1 ? country.substring(0, country.indexOf(":")) : country;
  }

  getLocation(type, id) {
    if (type == "user") {
      return this.client.provider.get("user", id, "location", this.client.defaults.location);
    } else if (type == "guild") {
      return this.client.provider.get("guild", id, "location", this.client.defaults.location);
    }
  }

  getPrefix(type, id) {
    if (type == "user") {
      return this.client.provider.get("user", id, "prefix", this.client.defaults.prefix);
    } else if (type == "guild") {
      return this.client.provider.get("guild", id, "prefix", this.client.defaults.prefix);
    }
  }
};
