const { Command } = require("discord-akairo");
const config = require("../../../../resource/config/config");
module.exports = class PingCommand extends Command {
  constructor() {
    super("username", {
      aliases: ["id"],
      description: "Set your default SteamID to use with commands.",
      args: [
        {
          id: "id",
          type: "string"
        }
      ]
    });
    this.format = "id {( SteamID / CustomID ) OR clear}";
    this.examples = ["id", "id clear", "id carrotstress"];
    this.details =
      "Set the default SteamID or CustomID to use with commands. Once this is set, the user does not need to be inputed for commands that require a user.";
  }

  async exec(msg, { id }) {
    const xEmoji = config.emoji.x;
    const cEmoji = config.emoji.c;
    if (!id) {
      let user = this.client.provider.get("user", msg.author.id, "steamid");
      if (!user) {
        return msg.util.send(
          "Your default SteamID is not currently set. Run `id [ SteamID / CustomID ]` to set your default SteamID."
        );
      }
      return msg.util.send(`Your default SteamID is set to \`${user}\``);
    } else if (id == "clear") {
      await this.client.provider.remove("user", msg.author.id, "steamid");
      return msg.util.send(`${cEmoji}Your default SteamID has been removed.`);
    } else if (id) {
      await this.client.provider.set("user", msg.author.id, "steamid", id);
      return msg.util.send(
        `${cEmoji}Your default SteamID has been set to \`${id}\``
      );
    }
  }
};
