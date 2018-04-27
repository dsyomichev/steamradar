const path = require("path");
module.exports = class PrefixCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("prefix", {
      aliases: ["prefix"],
      description: "Show or change the user and server prefix.",
      format: "prefix {(prefix) OR clear } {--user / -u OR --sever / -s}",
      examples: ["prefix", "prefix -u ;", "prefix --server steam", "prefix --user"],
      details: "View or change the command prefix for the server. Requires the `Manage Server` permission to change the server prefix.",
      args: [
        {
          id: "prefix",
          type: "string",
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
  }
  async exec(msg, { prefix, guild, user }) {
    const def = this.client.defaults.prefix;

    if (guild && !msg.guild) {
      return msg.util.deny({ title: "Invalid Channel", description: "You need to be in a server to use a server prefix." });
    }
    if (prefix && user && guild) {
      return msg.util.deny({ title: "Too Many Targets", description: `The server and user prefixes need to be changed separately.` });
    }
    if (prefix && msg.guild && !msg.member.hasPermission("MANAGE_SERVER")) {
      return msg.util.deny({ title: "Invalid Permissions", description: `You need to have the **Manage Server** permission to change the server prefix.` });
    }
    if (prefix && prefix.length > 10) {
      return msg.util.deny({ title: "Prefix Too Long", description: `Prefix should be under 10 characters long. You are ${prefix.length - 10} characters over!` });
    }
    if (!prefix) {
      let guildPrefix = msg.guild ? this.getPrefix("guild", msg.guild.id) : null;
      let userPrefix = this.getPrefix("user", msg.author.id);
      let userPrefixString = `Your user prefix is \`${userPrefix}\``;
      let guildPrefixString = `The server prefix is \`${guildPrefix}\``;
      let mentionString = `The default prefix \`${def}\` is always available. A mention \`@${this.client.user.tag}\` will also work instead of a prefix. `;

      if (!guild && !user) {
        if (msg.channel.type == "text") {
          return msg.util.confirm({ title: "Server & User Prefix", description: `${userPrefixString}\n${guildPrefixString}\n\n${mentionString}` });
        } else if (msg.channel.type == "dm") {
          return msg.util.confirm({ title: "User Prefix", description: `${userPrefixString}\n${mentionString}` });
        }
      } else if (guild && !user) {
        return msg.util.confirm({ title: "Server Prefix", description: `${guildPrefixString}\n${mentionString}` });
      } else if (!guild && user) {
        return msg.util.confirm({ title: "User Prefix", description: `${userPrefixString}\n${mentionString}` });
      } else if (guild && user) {
        if (msg.channel.type == "text") {
          return msg.util.confirm({ title: "Server & User Prefix", description: `${userPrefixString}\n${guildPrefixString}\n\n${mentionString}` });
        } else if (msg.channel.type == "dm") {
          return msg.util.confirm({ title: "User Prefix", description: `${userPrefixString}\n${mentionString}` });
        }
      }
    } else if (prefix == "clear") {
      const clearConfirm = type => {
        return `The ${type} prefix has been reset to \`${def}\``;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.remove("guild", msg.guild.id, "prefix");
          return msg.util.accept({ title: "Server Prefix", description: clearConfirm("server") });
        } else if (msg.channel.type == "dm") {
          this.client.provider.remove("user", msg.author.id, "prefix");
          return msg.util.accept({ title: "User Prefix", description: clearConfirm("user") });
        }
      } else if (guild && !user) {
        this.client.provider.remove("guild", msg.guild.id, "prefix");
        return msg.util.accept({ title: "Server Prefix", description: clearConfirm("server") });
      } else if (!guild && user) {
        this.client.provider.remove("user", msg.author.id, "prefix");
        return msg.util.accept({ title: "Server Prefix", description: clearConfirm("server") });
      }
    } else if (prefix) {
      const setConfirm = type => {
        return `The ${type} prefix has been set to \`${prefix}\``;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.set("guild", msg.guild.id, "prefix", prefix);
          return msg.util.confirm({ title: "Server Prefix", description: setConfirm("server") });
        } else if (msg.channel.type == "dm") {
          this.client.provider.set("user", msg.author.id, "prefix", prefix);
          return msg.util.confirm({ title: "User Prefix", description: setConfirm("user") });
        }
      } else if (guild && !user) {
        this.client.provider.set("guild", msg.guild.id, "prefix", prefix);
        return msg.util.confirm({ title: "Server Prefix", description: setConfirm("server") });
      } else if (!guild && user) {
        this.client.provider.set("user", msg.author.id, "prefix", prefix);
        return msg.util.confirm({ title: "User Prefix", description: setConfirm("user") });
      }
    }
  }
};
