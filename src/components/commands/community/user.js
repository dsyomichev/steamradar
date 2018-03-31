const Command = require("../../../structure/Command.js");

module.exports = class UserCommand extends Command {
  constructor() {
    super("user", {
      aliases: ["user"],
      description: "Search for a user by SteamID64, CustomURL ID, or username.",
      format: "user [(SteamID) OR (CustomID) OR (Username)]",
      examples: ["user carrotstress -i", "user 76561198205315656", "user Grumpy Cat --username"],
      steam: true,
      details: "Search for a user by SteamID64, CustomURL ID, or username.",
      args: [
        {
          id: "user",
          type: "string",
          default: msg => {
            return msg.client.provider.get("user", msg.author.id, "steamid", null);
          }
        },
        {
          id: "id",
          match: "flag",
          prefix: ["-i", "--id"]
        },
        {
          id: "username",
          match: "flag",
          prefix: ["-u", "--username"]
        }
      ]
    });
  }

  async exec(msg, { user, id, username }) {
    let search = await msg.util.accept({ title: "Searching..." });

    let steamid;
    if (id) steamid = await this.client.steam.resolveUser(user, "id");
    else if (username) steamid = await this.client.steam.resolveUser(user, "username");
    else steamid = await this.client.steam.resolveUser(user);

    if (!steamid) {
      return msg.util.deny({ title: "User not found.", description: "The ID or username provided did not point to any Steam user." });
    }
  }
};
