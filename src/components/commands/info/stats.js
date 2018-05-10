const moment = require("moment");
require("moment-duration-format");
const path = require("path");
module.exports = class StatsCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("stats", {
      aliases: ["stats"],
      description: "Show some random stats about the bot.",
      format: "stats",
      examples: ["stats"],
      details: "Show some inforamtion about the bot, such as servers uptime, and memory usage."
    });
  }

  async exec(msg) {
    let servers = this.client.guilds.size;
    let channels = this.client.channels.size;
    let users = this.client.guilds.map(guild => guild.memberCount).reduce((a, b) => a + b);
    let memory = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;
    let uptime = moment.duration(this.client.uptime).format("d[ Days], h[ Hours], m[ Minutes]");
    let dev = this.client.users.get(this.client.ownerID) ? this.client.users.get(this.client.ownerID).tag : "CarrotStress";

    return msg.util.embed({
      title: "SteamRadar Stats",
      fields: [
        {
          name: "Memory:",
          value: memory,
          inline: true
        },
        {
          name: "Uptime:",
          value: uptime,
          inline: true
        },
        {
          name: "General Stats:",
          value: `Servers: ${servers}\nChannels: ${channels}\nUsers: ${users}`,
          inline: true
        },
        {
          name: "Developer:",
          value: dev,
          inline: true
        }
      ],
      thumbnail: {
        url: this.client.user.displayAvatarURL()
      },
      color: msg.util.colors.confirm
    });
  }
};
