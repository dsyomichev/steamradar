const path = require("path");
module.exports = class GameCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("top", {
      aliases: ["top"],
      description: "Show 5 top selling games on the Steam Store.",
      format: "top",
      examples: ["top"],
      details: "Show 5 top selling games on the Steam Store."
    });
  }

  async exec(msg) {
    msg.util.searching();
    let games = await this.client.steam.storeTop(5);
    return msg.util.embed({
      color: msg.util.colors.confirm,
      title: "Top Selling Games on Steam",
      description: `1. ${games[0].name} - **${games[0].price}**\n2. ${games[1].name} - **${games[1].price}**\n3. ${games[2].name} - **${games[2].price}**\n4. ${
        games[3].name
      } - **${games[3].price}**\n5. ${games[4].name} - **${games[4].price}**`
    });
  }
};
