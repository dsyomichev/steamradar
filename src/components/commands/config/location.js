const path = require("path");
const cc = require("../../../../res/data/countries.json");
module.exports = class LocationCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("location", {
      aliases: ["location"],
      description: "Show or change the location of the user or server.",
      format: "location prefix { (CC) OR clear } { --user / -u OR --sever / -s }",
      examples: ["location", "location GB --server", "location -u IN"],
      details: "Change the server or users location using a 2 letter country code such as US, GB, or RU.",
      args: [
        {
          id: "location",
          type: "string"
        },
        {
          id: "guild",
          match: "flag",
          prefix: ["-s", "--server"]
        },
        {
          id: "user",
          match: "flag",
          prefix: ["-u", "--user"]
        }
      ]
    });
  }

  async exec(msg, { location, guild, user }) {
    const def = this.client.defaults.location;

    if (guild && !msg.guild) {
      return msg.util.deny({ title: "Invalid channel.", description: "You need to be in a server to use a server location." });
    }
    if (location && user && guild) {
      return msg.util.deny({ title: "Too many targets.", description: "The server and user locations need to be changed separately." });
    }
    if (location && msg.guild && !msg.member.hasPermission("MANAGE_SERVER")) {
      return msg.util.deny({ title: "Invalid permissions.", description: "You need to have the **Manage Server** permission to change the server location." });
    }
    if (location && location.length == 2) location = location.toUpperCase();
    if (location && location != "clear" && !cc[location]) {
      return msg.util.deny({ title: "Invalid CC", description: "The country code should be the two letter code representing the country." });
    }
    if (!location) {
      let guildLocation = msg.guild ? this.getLocation("guild", msg.guild.id) : null;
      let userLocation = this.getLocation("user", msg.author.id);
      let userLocationString = `Your user location is **${this.normalizeCC(userLocation)}** :flag_${userLocation ? userLocation.toLowerCase() : ""}:`;
      let guildLocationString = `The server location is **${this.normalizeCC(guildLocation)}** :flag_${guildLocation ? guildLocation.toLowerCase() : ""}:`;

      if (!guild && !user) {
        if (msg.channel.type == "text") {
          return msg.util.confirm({ title: "Server & User Location", description: `${userLocationString}\n${guildLocationString}` });
        } else if (msg.channel.type == "dm") {
          return msg.util.confirm({ title: "User Location", description: `${userLocationString}` });
        }
      } else if (guild && !user) {
        return msg.util.confirm({ title: "Server Location", description: `${guildLocationString}` });
      } else if (!guild && user) {
        return msg.util.confirm({ title: "User Location", description: `${userLocationString}` });
      } else if (guild && user) {
        if (msg.channel.type == "text") {
          return msg.util.confirm({ title: "Server & User Location", description: `${userLocationString}\n${guildLocationString}` });
        } else if (msg.channel.type == "dm") {
          return msg.util.confirm({ title: "User Location", description: `${userLocationString}` });
        }
      }
    } else if (location == "clear") {
      const clearConfirm = type => {
        return `The ${type} location has been reset to **${this.normalizeCC(def)}** :flag_${def.toLowerCase()}:`;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.set("guild", msg.guild.id, "location", def);
          return msg.util.accept({ title: "Server Location", description: clearConfirm("server") });
        } else if (msg.channel.type == "dm") {
          this.client.provider.set("user", msg.author.id, "location", def);
          return msg.util.accept({ title: "User Location", description: clearConfirm("user") });
        }
      } else if (guild && !user) {
        this.client.provider.set("guild", msg.guild.id, "location", def);
        return msg.util.accept({ title: "Server Location", description: clearConfirm("server") });
      } else if (!guild && user) {
        this.client.provider.set("user", msg.author.id, "location", def);
        return msg.util.accept({ title: "User Location", description: clearConfirm("user") });
      }
    } else if (location) {
      const setConfirm = type => {
        return `The ${type} location has been set to **${this.normalizeCC(location)}** :flag_${location.toLowerCase()}:`;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.set("guild", msg.guild.id, "location", location);
          return msg.util.confirm({ title: "Server Location", description: setConfirm("server") });
        } else if (msg.channel.type == "dm") {
          this.client.provider.set("user", msg.author.id, "location", location);
          return msg.util.confirm({ title: "User Location", description: setConfirm("user") });
        }
      } else if (guild && !user) {
        this.client.provider.set("guild", msg.guild.id, "location", location);
        return msg.util.confirm({ title: "Server Location", description: setConfirm("server") });
      } else if (!guild && user) {
        this.client.provider.set("user", msg.author.id, "location", location);
        return msg.util.confirm({ title: "User Location", description: setConfirm("user") });
      }
    }
  }
};
