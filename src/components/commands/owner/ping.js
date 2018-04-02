const path = require("path");
module.exports = class PingCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("ping", {
      aliases: ["ping"],
      format: "ping",
      examples: ["ping"],
      details: "Show the round trip and heartbeat ping of the bot.",
      description: "Get the ping to the Discord API.",
      ownerOnly: true
    });
  }

  async exec(msg) {
    const ping = await msg.util.send("Pinging...");
    return msg.util.send(`**Round Trip** : ${ping.createdTimestamp - msg.createdTimestamp}ms\n**Heartbeat** : ${this.client.ping ? `${Math.round(this.client.ping)}ms.` : ""}`);
  }
};
