const path = require("path");
module.exports = class CommandUtil extends require("discord-akairo").CommandUtil {
  constructor(client, message) {
    super(client, message);
    this.styles = require(path.join(client.configDirectory, "styles"));
  }

  embed(embed) {
    return this.send({ embed });
  }

  confirm({ title, description }) {
    return this.embed({
      color: this.styles.confirm,
      title,
      description
    });
  }

  accept({ title, description }) {
    return this.embed({
      color: this.styles.accept,
      title,
      description
    });
  }

  deny({ title, description }) {
    return this.embed({
      color: this.styles.deny,
      title,
      description
    });
  }

  error(err) {
    return this.embed({
      color: this.styles.deny,
      title: "Oops, something went really wrong.",
      description: this.message.author.id == this.client.ownerID ? `\`${err.name}: ${err.message}\`` : `Report this error here: \n${this.client.invite}`
    });
  }

  searching() {
    return this.embed({
      color: this.styles.accept,
      title: "Searching..."
    });
  }
};
