const Command = require("../../../structure/Command.js");

module.exports = class HelpCommand extends Command {
  constructor() {
    super("help", {
      aliases: ["help"],
      description: "Show a list of useful commands and links.",
      format: "help { (command name) }",
      examples: ["help", "help prefix", "help location"],
      details: "Find information about commands, and displays some useful links, such as support server invite and the full documentation.",
      protected: "true",
      args: [
        {
          id: "command",
          type: "string",
          default: ""
        }
      ]
    });
  }

  async exec(msg, { command }) {
    let prefix = "";
    if (msg.channel.type == "text") {
      prefix = this.client.provider.get("user", msg.author.id, "prefix", this.client.provider.get("guild", msg.guild.id, "prefix", this.client.prefix));
    }
    if (command) {
      let old = command;
      command = this.client.commandHandler.findCommand(command);
      if (!command || (command.ownerOnly == true && msg.author.id != this.client.ownerID))
        return msg.util.deny({
          title: "Command not found.",
          description: `\`${old}\` is not a command, check spelling or view the entire documentation here: https://steamradar.io/commands`
        });

      let name = `${command.aliases[0].charAt(0).toUpperCase()}${command.aliases[0].slice(1)} Command`;
      let format = command.format ? `**Command Format**\n\`${prefix}${command.format}\`` : "";
      let examples = "**Examples**\n";
      if (command.examples) {
        for (let example of command.examples) {
          examples += `\`${prefix}${example}\`\n`;
        }
      }
      return msg.util.confirm({ title: name, description: `${command.details ? command.details : command.description ? command.description : ""}\n\n${format}\n\n${examples}` });
    } else {
      return msg.util.accept({
        title: "SteamRadar Help",
        description: `**Commands:**\nhttps://steamradar.io/commands\nLearn about how to read the documentation here: https://steamradar.io/help/docs\n\n**Support**\nhttps://discord.gg/XrW5hqK\nFor help use \`#help\`\nFor reporting bugs use \`#bugs\`\nFor request features use \`#requests\`\n\n**Help Command**\n\`${prefix}help {(Command Name)}\` - Shows the built in documentation for the command.`
      });
    }
  }
};
