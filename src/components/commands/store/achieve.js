const path = require("path");
module.exports = class GameCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("achieve", {
      aliases: ["achieve"],
      description: "Show achievement info for a game, or stats about a specific acheivment.",
      format: "achieve [(Game Name) OR (AppID)]",
      examples: ["achieve csgo", 'achieve ark survival evolved -a="Rex Rider"', "achieve dota 2"],
      api: true,
      split: "sticky",
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
                  description: "What game would you like to get achievment info for?",
                  color: msg.util.colors.accept
                }
              };
            }
          }
        },
        {
          id: "achievement",
          match: "prefix",
          prefix: ["-a=", "--achievement="],
          type: "string"
        }
      ]
    });
  }

  async exec(msg, { game, achievement }) {
    msg.util.searching();
    let appid = await this.client.steam.resolveGame(game);
    if (!appid) return msg.util.deny({ title: "Game not found.", description: "The ID or name provided did not point to any Steam game." });

    let achieves = await this.client.steam.GetSchemaForGame({ appid });
    let percents = await this.client.steam.GetGlobalAchievementPercentagesForApp({ gameid: appid });
    let store = await this.client.steam.storePage(appid);
    achieves = achieves.game.availableGameStats.achievements;
    percents = percents.achievementpercentages.achievements;
    store = store[appid].data;

    if (achievement) {
      let specific = achieves.find(x => x.displayName == achievement);
      if (!specific) return msg.util.deny({ title: "Achievement not found.", description: `The name provided did not point to any achievement for ${store.name}.` });
      specific.percent = percents.find(x => x.name == specific.name).percent;
      return msg.util.embed({
        title: specific.displayName,
        description: specific.description,
        color: msg.util.colors.accept,
        thumbnail: {
          url: specific.icon
        },
        fields: [
          {
            name: `${Math.round(specific.percent * 100) / 100}% of players have this achievement.`,
            value: `\u200b`
          }
        ]
      });
    } else if (!achievement) {
      return msg.util.embed({
        title: `Achievements for ${store.name}`,
        color: msg.util.colors.confirm,
        description: `${store.name} has **${achieves.length}** achievements.`,
        thumbnail: { url: store.header_image }
      });
    }
  }
};
