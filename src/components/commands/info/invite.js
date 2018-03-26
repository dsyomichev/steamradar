const Command = require("../../../structure/Command.js");

module.exports = class InfoCommand extends Command {
  constructor() {
    super("invite", {
      aliases: ["invite"],
      description: "Get an invite link for the bot.",
      format: "invite",
      examples: ["invite"],
      details: "Shows an invite link for the bot."
    });
  }

  exec(msg) {
    msg.util.send(
      "Add SteamRadar using this link:\nhttps://steamradar.io/invite\n\nJoin the support server using this link:\nhttps://discord.gg/XrW5hqK"
    );
  }
};
