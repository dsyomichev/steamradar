module.exports = class SendMessages extends require("discord-akairo").Inhibitor {
  constructor() {
    super("send_messages", {
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
