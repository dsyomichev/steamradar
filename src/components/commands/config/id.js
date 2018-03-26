const Command = require("../../../structure/Command.js");
module.exports = class PingCommand extends Command {
  constructor() {
    super("username", {
      aliases: ["id"],
      description: "Set your default SteamID to use with commands.",
      format: "id {( SteamID / CustomID ) OR clear}",
      examples: ["id", "id clear", "id carrotstress"],
      details:
        "Set the default SteamID or CustomID to use with commands. Once this is set, the user does not need to be inputed for commands that require a user.",
      args: [
        {
          id: "id",
          type: "string"
        }
      ]
    });
  }

  async exec(msg, { id }) {
    const xEmoji = this.emoji.x;
    const cEmoji = this.emoji.c;
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
      id = await this.client.steam.resolveUser(id);
      if (!id) return msg.util.send(`${xEmoji} User could not be found.`);
      await this.client.provider.set("user", msg.author.id, "steamid", id);
      return msg.util.send(
        `${cEmoji}Your default SteamID has been set to \`${id}\``
      );
    }
  }
};
