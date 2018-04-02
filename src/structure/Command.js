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
};
