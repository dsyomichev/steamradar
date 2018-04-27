const rp = require("request-promise");
module.exports = class Upvote extends require("discord-akairo").Inhibitor {
  constructor() {
    super("upvote", {
      reason: "upvote"
    });
  }

  async exec(msg, cmd) {
    if (cmd.upvote) {
      if (msg.author.id == this.client.ownerID) return false;
      let upvote;
      try {
        upvote = JSON.parse(
          await rp({
            uri: `https://www.steamradar.pw/api/v1/users/${msg.author.id}/upvote`,
            headers: {
              Authorization: `Bearer ${this.client.site_token}`
            }
          })
        );
      } catch (err) {
        msg.util.deny({ title: "Upvote Required", description: `Please upvote the bot to use this command.\n${msg.client.upvote}` });
        return true;
      }
      if (upvote.upvote) return false;
      msg.util.deny({ title: "Upvote Required", description: `Please upvote the bot to use this command.\n${msg.client.upvote}` });
      return true;
    }
    return false;
  }
};
