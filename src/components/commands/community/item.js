const path = require("path");
module.exports = class ItemCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("item", {
      aliases: ["item"],
      description: "Show prices for an item on the Community Market",
      format: "item [(Item Name)]",
      examples: ["item asiimov", "item case", "item sand dune"],
      api: true,
      details: "Show price information for an item listed on the Community Market.",
      args: [
        {
          id: "item",
          match: "rest",
          type: "string",
          prompt: {
            start: msg => {
              return {
                embed: {
                  author: { name: msg.author.username, icon_url: msg.author.displayAvatarURL() },
                  description: "What item would you like to search for?",
                  color: msg.util.colors.accept
                }
              };
            }
          }
        }
      ]
    });
  }

  async exec(msg, { item }) {
    msg.util.searching();

    item = await this.client.steam.searchItem(item);

    return msg.util.embed({
      thumbnail: {
        url: item.icon
      },
      title: item.name,
      footer: { text: `${item.game} | ${item.listings} Listings` },
      color: parseInt(item.color, 16),
      fields: [{ name: "Sell Price", value: item.price, inline: true }, { name: "Order Price", value: item.order, inline: true }]
    });
  }
};
