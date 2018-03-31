const { Inhibitor } = require("discord-akairo");

module.exports = class sendMessages extends Inhibitor {
  constructor() {
    super("perms", {
      reason: "send_messages"
    });
  }

  exec(msg) {
    if (msg.channel.type == "text") {
      if (msg.channel.permissionsFor(msg.guild.me).has("SEND_MESSAGES") == false) {
        return true;
      }
    }
    return false;
  }
};
