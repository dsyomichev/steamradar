const Command = require("../../../structure/Command.js");

module.exports = class UserCommand extends Command {
  constructor() {
    super("user", {
      aliases: ["user"],
      description: "Search for a user by SteamID64, CustomURL ID, or username.",
      format: "user [(SteamID) OR (CustomID) OR (Username)]",
      examples: [
        "user carrotstress",
        "user 76561198205315656",
        "user Grumpy Cat"
      ],
      steam: true,
      details: "Search for a user by SteamID64, CustomURL ID, or username.",
      args: [
        {
          id: "user",
          type: "string",
          default: msg => {
            return msg.client.provider.get(
              "user",
              msg.author.id,
              "steamid",
              null
            );
          }
        }
      ]
    });
  }

  async exec(msg, { user }) {}
};
