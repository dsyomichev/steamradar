const { Command } = require("discord-akairo");
const config = require("../../../../resource/config/config");
module.exports = class PrefixCommand extends Command {
  constructor() {
    super("prefix", {
      aliases: ["prefix"],
      description: "Show or change the user and server prefix.",
      args: [
        {
          id: "prefix",
          type: "string",
          default: "",
          match: "rest"
        },
        {
          id: "guild",
          match: "flag",
          prefix: ["--server", "-s"]
        },
        {
          id: "user",
          match: "flag",
          prefix: ["--user", "-u"]
        }
      ]
    });
    this.format = "prefix {(prefix) OR clear } {--user / -u OR --sever / -s}";
    this.examples = [
      "prefix",
      "prefix -u ;",
      "prefix --server steam",
      "prefix --user"
    ];
    this.details =
      "View or change the command prefix for the server. Requires the `Manage Server` permission to change the server prefix.";
  }
  async exec(msg, { prefix, guild, user }) {
    const defaultPrefix = config.settings.prefix;
    const xEmoji = config.emoji.x;
    const cEmoji = config.emoji.c;
    const getPrefix = type => {
      if (type == "user") {
        return this.client.provider.get(
          "user",
          msg.author.id,
          "prefix",
          defaultPrefix
        );
      } else if (type == "guild") {
        return this.client.provider.get(
          "guild",
          msg.guild.id,
          "prefix",
          defaultPrefix
        );
      }
    };
    if (prefix && user && guild) {
      return msg.util.send(
        `${xEmoji}The server and user prefixes need to be changed separately.`
      );
    }
    if (guild && !msg.guild) {
      return msg.util.send(
        `${xEmoji}You need to be in a server to use a server prefix.`
      );
    }
    if (prefix && msg.guild && !msg.member.hasPermission("MANAGE_SERVER")) {
      return msg.util.send(
        `${xEmoji}You need to have the **Manage Server** permission to change the server prefix.`
      );
    }
    if (prefix.length > 10) {
      return msg.util.send(
        `${xEmoji}Prefix should be under 10 characters long. You are ${prefix.length -
          10} characters over!`
      );
    }
    if (!prefix) {
      let guildPrefix = msg.guild ? getPrefix("guild") : null;
      let userPrefix = getPrefix("user");
      let userPrefixString = `Your user prefix is \`${userPrefix}\` \n _*Change this by running*_ \`prefix --user [NEW PREFIX]\``;
      let guildPrefixString = `The server prefix is \`${guildPrefix}\` \n _*Change this by running*_ \`prefix --server [NEW PREFIX]\``;
      let mentionString = `The default prefix \`${defaultPrefix}\` is always available. A mention \`@${
        this.client.user.tag
      }\` will also work instead of a prefix. `;
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          return msg.util.send(
            `${userPrefixString}\n\n${guildPrefixString}\n\n${mentionString}`
          );
        } else if (msg.channel.type == "dm") {
          return msg.util.send(`${userPrefixString}\n\n${mentionString}`);
        }
      } else if (guild && !user) {
        return msg.util.send(`${guildPrefixString}\n\n${mentionString}`);
      } else if (!guild && user) {
        return msg.util.send(`${userPrefixString}\n\n${mentionString}`);
      } else if (guild && user) {
        if (msg.channel.type == "text") {
          return msg.util.send(
            `${userPrefixString}\n\n${guildPrefixString}\n\n${mentionString}`
          );
        } else if (msg.channel.type == "dm") {
          return msg.util.send(`${userPrefixString}\n\n${mentionString}`);
        }
      }
    } else if (prefix == "clear") {
      const clearConfirm = type => {
        return `${cEmoji}The ${type} prefix has been reset to \`${defaultPrefix}\``;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.remove("guild", msg.guild.id, "prefix");
          return msg.util.send(clearConfirm("server"));
        } else if (msg.channel.type == "dm") {
          this.client.provider.remove("user", msg.author.id, "prefix");
          return msg.util.send(clearConfirm("user"));
        }
      } else if (guild && !user) {
        this.client.provider.remove("guild", msg.guild.id, "prefix");
        return msg.util.send(clearConfirm("server"));
      } else if (!guild && user) {
        this.client.provider.remove("user", msg.author.id, "prefix");
        return msg.util.send(clearConfirm("user"));
      }
    } else if (prefix) {
      const setConfirm = type => {
        return `${cEmoji}The ${type} prefix has been set to \`${prefix}\``;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.set("guild", msg.guild.id, "prefix", prefix);
          return msg.util.send(setConfirm("server"));
        } else if (msg.channel.type == "dm") {
          this.client.provider.set("user", msg.author.id, "prefix", prefix);
          return msg.util.send(setConfirm("user"));
        }
      } else if (guild && !user) {
        this.client.provider.set("guild", msg.guild.id, "prefix", prefix);
        return msg.util.send(setConfirm("server"));
      } else if (!guild && user) {
        this.client.provider.set("user", msg.author.id, "prefix", prefix);
        return msg.util.send(setConfirm("user"));
      }
    }
  }
};
