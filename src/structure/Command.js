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

  invalid(title = "", message = "") {
    return {
      embed: {
        color: this.colors.error,
        title: title,
        description: message
      }
    };
  }

  confirm(title = "", message = "") {
    return {
      embed: {
        color: this.colors.main,
        title: title,
        description: message
      }
    };
  }

  alt(title = "", message = "") {
    return {
      embed: {
        color: this.colors.alt,
        title: title,
        description: message
      }
    };
  }
};
