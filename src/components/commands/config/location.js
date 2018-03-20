const { Command } = require("discord-akairo");
const config = require("../../../../resource/config/config");
const cc = require("../../../../resource/data/countries.json");
module.exports = class LocationCommand extends Command {
  constructor() {
    super("location", {
      aliases: ["location"],
      description: "Show or change the location of the user or server.",
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
    this.format =
      "location prefix { (CC) OR clear } { --user / -u OR --sever / -s }";
    this.examples = ["location", "location GB --server", "location -u IN"];
    this.details =
      "Change the server or users location using a 2 letter country code such as US, GB, or RU.";
  }

  async exec(msg, { location, guild, user }) {
    const defLoc = config.settings.location;
    const xEmoji = config.emoji.x;
    const cEmoji = config.emoji.c;
    const getLocation = type => {
      if (type == "user") {
        return this.client.provider.get(
          "user",
          msg.author.id,
          "location",
          defLoc
        );
      } else if (type == "guild") {
        return this.client.provider.get(
          "guild",
          msg.guild.id,
          "location",
          defLoc
        );
      }
    };
    const norm = code => {
      let country = cc[code];
      if (!country) return;
      return country.indexOf(":") != -1
        ? country.substring(0, country.indexOf(":"))
        : country;
    };

    if (location && user && guild) {
      return msg.util.send(
        `${xEmoji}The server and user locations need to be changed separately.`
      );
    }
    if (guild && !msg.guild) {
      return msg.util.send(
        `${xEmoji}You need to be in a server to use a server location.`
      );
    }
    if (location && msg.guild && !msg.member.hasPermission("MANAGE_SERVER")) {
      return msg.util.send(
        `${xEmoji}You need to have the **Manage Server** permission to change the server location.`
      );
    }
    if (location && location.length == 2) location = location.toUpperCase();
    if (location && location != "clear" && !cc[location]) {
      return msg.util.send(`${xEmoji}Thats an invalid country code.`);
    }
    if (!location) {
      let guildLocation = msg.guild ? getLocation("guild") : null;
      let userLocation = getLocation("user");
      let userLocationString = `Your user location is **${norm(
        userLocation
      )}** :flag_${userLocation.toLowerCase()}: \n _*Change this by running*_ \`location --user [CC]\``;
      let guildLocationString = `The server location is **${norm(
        guildLocation
      )}** :flag_${
        guildLocation ? guildLocation.toLowerCase() : ""
      }: \n _*Change this by running*_ \`location --user [CC]\``;
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          return msg.util.send(
            `${userLocationString}\n\n${guildLocationString}`
          );
        } else if (msg.channel.type == "dm") {
          return msg.util.send(`${userLocationString}`);
        }
      } else if (guild && !user) {
        return msg.util.send(`${guildLocationString}`);
      } else if (!guild && user) {
        return msg.util.send(`${userLocationString}`);
      } else if (guild && user) {
        return msg.util.send(`${userLocationString}\n\n${guildLocationString}`);
      }
    } else if (location == "clear") {
      const clearConfirm = type => {
        return `${cEmoji}The ${type} location has been reset to **${norm(
          defLoc
        )}** :flag_${defLoc.toLowerCase()}:`;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.set("guild", msg.guild.id, "location", defLoc);
          return msg.util.send(clearConfirm("server"));
        } else if (msg.channel.type == "dm") {
          this.client.provider.set("user", msg.author.id, "location", defLoc);
          return msg.util.send(clearConfirm("user"));
        }
      } else if (guild && !user) {
        this.client.provider.set("guild", msg.guild.id, "location", defLoc);
        return msg.util.send(clearConfirm("server"));
      } else if (!guild && user) {
        this.client.provider.set("user", msg.author.id, "location", defLoc);
        return msg.util.send(clearConfirm("user"));
      }
    } else if (location) {
      const setConfirm = type => {
        return `${cEmoji}The ${type} location has been set to **${norm(
          location
        )}** :flag_${location.toLowerCase()}:`;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.set("guild", msg.guild.id, "location", location);
          return msg.util.send(setConfirm("server"));
        } else if (msg.channel.type == "dm") {
          this.client.provider.set("user", msg.author.id, "location", location);
          return msg.util.send(setConfirm("user"));
        }
      } else if (guild && !user) {
        this.client.provider.set("guild", msg.guild.id, "location", location);
        return msg.util.send(setConfirm("server"));
      } else if (!guild && user) {
        this.client.provider.set("user", msg.author.id, "location", location);
        return msg.util.send(setConfirm("user"));
      }
    }
  }
};
