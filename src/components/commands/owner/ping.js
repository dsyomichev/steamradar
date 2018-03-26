const Command = require("../../../structure/Command.js");
module.exports = class PingCommand extends Command {
  constructor() {
    super("ping", {
      aliases: ["ping"],
      format:"ping",
      examples:["ping"],
      details:"Show the round trip and heartbeat ping of the bot.",
      description: "Get the ping to the Discord API.",
      ownerOnly: true
    });
  }

  async exec(msg) {
    const ping = await msg.util.send("Pinging...");
    return ping.edit(
      `**Round Trip** : ${ping.createdTimestamp -
        msg.createdTimestamp}ms\n**Heartbeat** : ${
        this.client.ping ? `${Math.round(this.client.ping)}ms.` : ""
      }`
    );
  }
};
