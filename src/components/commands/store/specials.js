const path = require("path");
module.exports = class SpecialsCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("specials", {
      aliases: ["specials"],
      description: "Show 5 specials on the Steam Store.",
      format: "specials",
      examples: ["specials"],
      details: "Show 5 specials on the Steam Store."
    });
  }

  async exec(msg) {
    msg.util.searching();
    let games = await this.client.steam.storeSale(5);

    return msg.util.embed({
      color: msg.util.colors.confirm,
      title: "Specials on Steam",
      description: `1. ${games[0].name} - **${games[0].price}** (${games[0].discount})\n2. ${games[1].name} - **${games[1].price}** (${games[1].discount})\n3. ${
        games[2].name
      } - **${games[2].price}** (${games[2].discount})\n4. ${games[3].name} - **${games[3].price}** (${games[3].discount})\n5. ${games[4].name} - **${games[4].price}** (${
        games[4].discount
      })`
    });
  }
};
