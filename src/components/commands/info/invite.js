const path = require("path");
module.exports = class InviteCommand extends require(path.resolve("src/structure/Command")) {
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
    msg.util.confirm({
      title: "SteamRadar Invites",
      description: `Add SteamRadar using this link:\n${this.client.invite}\n\nJoin the support server using this link:\n${this.client.server}`
    });
  }
};
