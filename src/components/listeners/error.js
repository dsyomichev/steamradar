const { Listener } = require("discord-akairo");
const logger = require("../base/log");
const config = require("../../../resource/config/config");
module.exports = class ErrorListener extends Listener {
  constructor() {
    super("error", {
      emitter: "commandHandler",
      event: "error"
    });
  }

  exec(err, msg, cmd) {
    logger.error(`Command Error | ${err} [ ${cmd} ]`);
    msg.util.send(`${config.emoji.x}Something went wrong during the process of running the command.\nTo get this fixed ASAP, please join the support server and report the error.\nhttps://discord.gg/XrW5hqK`)
  }
};
