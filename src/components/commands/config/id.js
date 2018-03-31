const Command = require("../../../structure/Command.js");
module.exports = class PingCommand extends Command {
  constructor() {
    super("username", {
      aliases: ["id"],
      description: "Set your default SteamID to use with commands.",
      format: "id {( SteamID / CustomID ) OR clear}",
      examples: ["id", "id clear", "id carrotstress"],
      details: "Set the default SteamID or CustomID to use with commands. Once this is set, the user does not need to be inputed for commands that require a user.",
      args: [
        {
          id: "id",
          type: "string"
        }
      ]
    });
  }

  async exec(msg, { id }) {
    if (!id) {
      let user = this.client.provider.get("user", msg.author.id, "steamid");
      if (!user) {
        return msg.util.accept({ title: "Default SteamID not set.", description: "Your default SteamID is not currently set." });
      }
      return msg.util.confirm({ title: "Default SteamID", description: `Your default SteamID is set to \`${user}\`` });
    } else if (id == "clear") {
      await this.client.provider.remove("user", msg.author.id, "steamid");
      return msg.util.accept({ title: "Default SteamID Cleared", description: "Your default SteamID has been removed. Commands will now require you to input a user." });
    } else if (id) {
      id = await this.client.steam.resolveUser(id);
      if (!id) return msg.util.deny({ title: "User Not Found", description: "A user with that ID or username was not found." });
      await this.client.provider.set("user", msg.author.id, "steamid", id);
      return msg.util.confirm({ title: "Default ID Set", description: `Your default SteamID has been set to \`${id}\`` });
    }
  }
};
