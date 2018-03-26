const { Listener } = require("discord-akairo");
module.exports = class ErrorListener extends Listener {
  constructor() {
    super("error", {
      emitter: "commandHandler",
      event: "error"
    });
  }

  exec(err, msg, cmd) {
    this.client.logger.error(`Command Error | ${err} [ ${cmd} ]`);
    msg.util.send(
      `Something went wrong during the process of running the command.\nTo get this fixed ASAP, please join the support server and report the error.\nhttps://discord.gg/XrW5hqK`
    );
  }
};
