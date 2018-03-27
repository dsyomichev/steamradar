const Command = require("../../../structure/Command.js");
module.exports = class PrefixCommand extends Command {
  constructor() {
    super("prefix", {
      aliases: ["prefix"],
      description: "Show or change the user and server prefix.",
      format: "prefix {(prefix) OR clear } {--user / -u OR --sever / -s}",
      examples: [
        "prefix",
        "prefix -u ;",
        "prefix --server steam",
        "prefix --user"
      ],
      details:
        "View or change the command prefix for the server. Requires the `Manage Server` permission to change the server prefix.",
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
    const defaultPrefix = this.client.prefix;
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
    if (guild && !msg.guild) {
      return msg.util.send(
        this.invalid(
          "Invalid Channel",
          "You need to be in a server to use a server prefix."
        )
      );
    }
    if (prefix && user && guild) {
      return msg.util.send(
        this.invalid(
          "Too Many Targets",
          `The server and user prefixes need to be changed separately.`
        )
      );
    }
    if (prefix && msg.guild && !msg.member.hasPermission("MANAGE_SERVER")) {
      return msg.util.send(
        this.invalid(
          "Invalid Permissions",
          `You need to have the **Manage Server** permission to change the server prefix.`
        )
      );
    }
    if (prefix && prefix.length > 10) {
      return msg.util.send(
        this.invalid(
          "Prefix Too Long",
          `Prefix should be under 10 characters long. You are ${prefix.length -
            10} characters over!`
        )
      );
    }
    if (!prefix) {
      let guildPrefix = msg.guild ? getPrefix("guild") : null;
      let userPrefix = getPrefix("user");
      let userPrefixString = `Your user prefix is \`${userPrefix}\``;
      let guildPrefixString = `The server prefix is \`${guildPrefix}\``;
      let mentionString = `The default prefix \`${defaultPrefix}\` is always available. A mention \`@${
        this.client.user.tag
      }\` will also work instead of a prefix. `;

      if (!guild && !user) {
        if (msg.channel.type == "text") {
          return msg.util.send(
            this.confirm(
              "Server & User Prefix",
              `${userPrefixString}\n${guildPrefixString}\n\n${mentionString}`
            )
          );
        } else if (msg.channel.type == "dm") {
          return msg.util.send(
            this.confirm("User Prefix", `${userPrefixString}\n${mentionString}`)
          );
        }
      } else if (guild && !user) {
        return msg.util.send(
          this.confirm(
            "Server Prefix",
            `${guildPrefixString}\n${mentionString}`
          )
        );
      } else if (!guild && user) {
        return msg.util.send(
          this.confirm("User Prefix", `${userPrefixString}\n${mentionString}`)
        );
      } else if (guild && user) {
        if (msg.channel.type == "text") {
          return msg.util.send(
            this.confirm(
              "Server & User Prefix",
              `${userPrefixString}\n${guildPrefixString}\n\n${mentionString}`
            )
          );
        } else if (msg.channel.type == "dm") {
          return msg.util.send(
            this.confirm("User Prefix", `${userPrefixString}\n${mentionString}`)
          );
        }
      }
    } else if (prefix == "clear") {
      const clearConfirm = type => {
        return `The ${type} prefix has been reset to \`${defaultPrefix}\``;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.remove("guild", msg.guild.id, "prefix");
          return msg.util.send(
            this.alt("Server Prefix", clearConfirm("server"))
          );
        } else if (msg.channel.type == "dm") {
          this.client.provider.remove("user", msg.author.id, "prefix");
          return msg.util.send(this.alt("User Prefix", clearConfirm("user")));
        }
      } else if (guild && !user) {
        this.client.provider.remove("guild", msg.guild.id, "prefix");
        return msg.util.send(this.alt("Server Prefix", clearConfirm("server")));
      } else if (!guild && user) {
        this.client.provider.remove("user", msg.author.id, "prefix");
        return msg.util.send(this.alt("Server Prefix", clearConfirm("server")));
      }
    } else if (prefix) {
      const setConfirm = type => {
        return `The ${type} prefix has been set to \`${prefix}\``;
      };
      if (!guild && !user) {
        if (msg.channel.type == "text") {
          this.client.provider.set("guild", msg.guild.id, "prefix", prefix);
          return msg.util.send(this.alt("Server Prefix", setConfirm("server")));
        } else if (msg.channel.type == "dm") {
          this.client.provider.set("user", msg.author.id, "prefix", prefix);
          return msg.util.send(this.alt("User Prefix", setConfirm("user")));
        }
      } else if (guild && !user) {
        this.client.provider.set("guild", msg.guild.id, "prefix", prefix);
        return msg.util.send(this.alt("Server Prefix", setConfirm("server")));
      } else if (!guild && user) {
        this.client.provider.set("user", msg.author.id, "prefix", prefix);
        return msg.util.send(this.alt("User Prefix", setConfirm("user")));
      }
    }
  }
};
