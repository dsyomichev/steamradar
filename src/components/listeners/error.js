const { Listener } = require("discord-akairo");
module.exports = class ErrorListener extends Listener {
  constructor() {
    super("error", {
      emitter: "commandHandler",
      event: "error"
    });
  }

  exec(err, msg, cmd) {
    console.log(err);
    this.client.log.error(`Command Error | ${err} [ ${cmd} ]`);
    return msg.util.error(err);
  }
};
