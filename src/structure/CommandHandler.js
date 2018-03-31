const path = require("path");
const { BuiltInReasons, CommandHandlerEvents } = require("discord-akairo").Constants;
const CommandUtil = require(path.resolve("src/structure/CommandUtil"));

module.exports = class CommandHandler extends require("discord-akairo").CommandHandler {
  async handle(message) {
    try {
      if (this.fetchMembers && message.guild && !message.member && !message.webhookID) {
        await message.guild.members.fetch(message.author);
      }

      let reason = this.client.inhibitorHandler ? await this.client.inhibitorHandler.test("all", message) : null;

      if (reason != null) {
        this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        return;
      }

      if (this.blockOthers && message.author.id !== this.client.user.id && this.client.selfbot) {
        this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.OTHERS);
        return;
      }

      if (this.blockClient && message.author.id === this.client.user.id && !this.client.selfbot) {
        this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
        return;
      }

      if (this.blockBots && message.author.bot) {
        this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
        return;
      }

      if (this.commandUtil) {
        if (this.commandUtils.has(message.id)) {
          message.util = this.commandUtils.get(message.id);
        } else {
          message.util = new CommandUtil(this.client, message);
          this.commandUtils.set(message.id, message.util);

          if (this.commandUtilLifetime) {
            this.client.setTimeout(() => this.commandUtils.delete(message.id), this.commandUtilLifetime);
          }
        }
      }

      reason = this.client.inhibitorHandler ? await this.client.inhibitorHandler.test("pre", message) : null;

      if (reason != null) {
        this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        return;
      }

      if (this.hasPrompt(message.channel, message.author)) {
        this.emit(CommandHandlerEvents.IN_PROMPT, message);
        return;
      }

      const parsed = this._parseCommand(message) || {};
      const { command, content, prefix, alias } = parsed;

      if (this.commandUtil) {
        Object.assign(message.util, {
          command,
          prefix,
          alias,
          content
        });
      }

      if (!parsed.command) {
        this._handleTriggers(message);
        return;
      }

      this._handleCommand(message, content, command);
    } catch (err) {
      this._handleError(err, message);
    }
  }
};
