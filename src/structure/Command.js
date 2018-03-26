module.exports = class Command extends require("discord-akairo").Command {
  constructor(id, options = {}) {
    super(id, options);
    let { format = "", examples = [], details = "", steam = false } = options;
    this.format = format;
    this.examples = examples;
    this.details = details;
    this.steam = Boolean(steam);

    let config = require("../../resource/config/config");
    this.colors = config.colors;
    this.emoji = config.emoji;
  }

  error(message) {}

  confirm(message) {}
};
