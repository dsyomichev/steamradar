const path = require("path");
module.exports = class GameCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("game", {
      aliases: ["game"],
      description: "Show prices, ratings and stats for a game on the store.",
      format: "game [(Game Name) OR (AppID)]",
      examples: ["game csgo", "game ark", "game dota 2"],
      api: true,
      details: "Show prices, ratings and stats for a game that is on the steam store.",
      args: [
        {
          id: "game",
          match: "rest",
          type: "string",
          prompt: {
            start: msg => {
              return {
                embed: {
                  author: { name: msg.author.username, icon_url: msg.author.displayAvatarURL() },
                  description: "What game would you like to search for?",
                  color: msg.util.colors.accept
                }
              };
            }
          }
        },
        {
          id: "location",
          match: "prefix",
          prefix: ["-l=", "--location="],
          default: msg => {
            if (msg.channel.type == "text") {
              return msg.client.provider.get("user", msg.author.id, "location", msg.client.provider.get("guild", msg.guild.id, "location", msg.client.defaults.location));
            }
            return msg.client.provider.get("user", msg.author.id, "location", msg.client.defaults.location);
          }
        }
      ]
    });
  }

  async exec(msg, { game, location }) {
    msg.util.searching();
    if (location == "user") location = this.client.provider.get("user", msg.author.id, "location", this.client.defaults.location);
    else if (location == "server") location = this.client.provider.get("guild", msg.guild.id, "location", this.client.defaults.location);
    else location = location;
    if (!this.client.data.cc[location]) return msg.util.deny({ title: "Invalid Location", description: "Thats not a valid country code." });

    let appid = await this.client.steam.resolveGame(game);
    if (!appid) return msg.util.deny({ title: "Game not found.", description: "The ID or name provided did not point to any Steam game." });

    let { store, players, review } = {
      store: await this.client.steam.storePage(appid, location),
      players: await this.client.steam.GetNumberOfCurrentPlayers({ appid }),
      review: await this.client.steam.appReviews(appid)
    };

    store = store[appid].data;
    players = players.response.player_count;

    let price = "N/A";
    let discount = "None";
    if (store.is_free) {
      price = "Free";
    } else if (store.price_overview) {
      discount = `-${store.price_overview.discount_percent}%`;
      let price_string = store.price_overview.final.toString();
      price = `${this.client.data.cur[store.price_overview.currency]}${price_string.slice(0, -2)}.${price_string.slice(-2)}`;
    }
    return msg.util.embed({
      color: msg.util.colors.confirm,
      title: store.name,
      description: `http://store.steampowered.com/app/${appid}/`,
      thumbnail: {
        url: store.header_image
      },
      fields: [
        {
          name: "Price",
          value: `${price}\n\u200b`,
          inline: true
        },
        {
          name: "Discount",
          value: `${discount}\n\u200b`,
          inline: true
        },
        {
          name: "Current Players",
          value: `${players.toLocaleString()}\n\u200b`,
          inline: true
        },
        {
          name: "Reviews",
          value: `${review}% of reviews are positive.\n\u200b`,
          inline: true
        },
        {
          name: "OS Support",
          value: `**Windows** : ${store.platforms.windows ? msg.util.emoji.yes : msg.util.emoji.no}  |  **Mac OS** : ${
            store.platforms.mac ? msg.util.emoji.yes : msg.util.emoji.no
          }  |   **Linux** : ${store.platforms.linux ? msg.util.emoji.yes : msg.util.emoji.no}`
        }
      ]
    });
  }
};
