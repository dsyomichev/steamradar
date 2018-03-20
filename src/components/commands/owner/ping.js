const { Command } = require("discord-akairo");
module.exports = class PingCommand extends Command {
  constructor() {
    super("ping", {
      aliases: ["ping"],
      description: "Get the ping to the Discord API.",
      ownerOnly: true
    });
    this.format = "ping";
    this.examples = ["ping"];
    this.details = "Show the round trip and heartbeat ping of the bot.";
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
