module.exports = class CooldownListener extends require("discord-akairo").Listener {
  constructor() {
    super("cooldown", {
      emitter: "commandHandler",
      event: "cooldown"
    });
  }

  exec(msg, cmd, remaining) {
    msg.util.deny({ title: "Command Cooldown", description: `You need to wait \`${remaining / 1000}\` seconds before using this command again.` });
    this.client.log.debug(`Command Cooldown | ${cmd} [ ${remaining} ]`);
  }
};
