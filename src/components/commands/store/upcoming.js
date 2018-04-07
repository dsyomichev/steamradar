const path = require("path");
module.exports = class UpcomingCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("upcoming", {
      aliases: ["upcoming"],
      description: "Show 5 upcoming games on the Steam Store.",
      format: "upcoming",
      examples: ["upcoming"],
      details: "Show 5 upcoming games on the Steam Store."
    });
  }

  async exec(msg) {
    msg.util.searching();
    let games = await this.client.steam.storeUpcoming(5);

    return msg.util.embed({
      color: msg.util.colors.confirm,
      title: "Upcoming Games on Steam",
      description: `1. ${games[0].name} - **${games[0].date}**\n2. ${games[1].name} - **${games[1].date}**\n3. ${games[2].name} - **${games[2].date}**\n4. ${games[3].name} - **${
        games[3].date
      }**\n5. ${games[4].name} - **${games[4].date}**`
    });
  }
};
