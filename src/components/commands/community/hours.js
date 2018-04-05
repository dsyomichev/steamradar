const path = require("path");
const moment = require("moment");
module.exports = class UserCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("hours", {
      aliases: ["hours"],
      description: "Get the top 5 games a user has in terms of hours, or the amount of hours a user has for a single game.",
      format: "hours [(SteamID) OR (CustomID) OR (Username)] {(AppID) OR (Game Name)}",
      examples: ["hours carrotstress -i", "hours -g=csgo", 'hours Grumpy Cat --username --game="ark survival evolved"'],
      api: true,
      details: "Get the top played games by hours for a user, or the hours for a specific game in the users game library.",
      split: "sticky",
      args: [
        {
          id: "user",
          type: "string",
          match: "rest",
          default: msg => {
            return msg.client.provider.get("user", msg.author.id, "steamid", null);
          }
        },
        {
          id: "game",
          type: "string",
          match: "prefix",
          prefix: ["--game=", "-g="]
        },
        {
          id: "id",
          match: "flag",
          prefix: ["-i", "--id"]
        },
        {
          id: "username",
          match: "flag",
          prefix: ["-u", "--username"]
        }
      ]
    });
  }

  async exec(msg, { user, game, id, username }) {
    let search = await msg.util.searching();
    if (!user) return msg.util.deny({ title: "Default ID not set.", description: "You need to set a default ID before using this command without an input." });
    let steamid;
    if (id) steamid = await this.client.steam.resolveUser(user, "id");
    else if (username) steamid = await this.client.steam.resolveUser(user, "username");
    else steamid = await this.client.steam.resolveUser(user);
    if (!steamid) return msg.util.deny({ title: "User not found.", description: "The ID or username provided did not point to any Steam user." });
    let owned = await this.client.steam.GetOwnedGames({ steamid, include_appinfo: true, include_played_free_games: true }).catch(err => {});
    owned = owned.response.games;
    let summary = await this.client.steam.GetPlayerSummaries({ steamids: steamid });

    if ((summary.private = summary.communityvisibilitystate == 3 ? true : false))
      return msg.util.deny({ title: "Private Profile", description: "The user's profile is set to private. Game hours cannot be viewed." });
    if (!game) {
      let total = owned
        .sort((a, b) => {
          return a.playtime_forever > b.playtime_forever ? 1 : b.playtime_forever > a.playtime_forever ? -1 : 0;
        })
        .reverse();

      let top = "\u200b\n";
      for (let i = 0; i < (total.length > 5 ? 5 : total.length); i++) {
        top += `**${total[i].name}**: ${Math.round(total[i].playtime_forever / 60)} Hours\n\n`;
      }
      msg.util.embed({
        title: "Top 5 played games.",
        description: top,
        color: msg.util.colors.accept,
        author: {
          name: summary.response.players[0].personaname,
          icon_url: summary.response.players[0].avatarfull
        }
      });
    } else if (game) {
      let appid = await this.client.steam.resolveGame(game);
      if (!appid) return msg.util.deny({ title: "Game not found.", description: "The ID or name provided did not point to any Steam game." });
      let app = owned.find(x => x.appid == appid);
      if (!app) return msg.util.deny({ title: "Game not in library.", description: `The user does not own this game, so hours for it cannot be shown.` });
      return msg.util.embed({
        color: msg.util.colors.confirm,
        title: app.name,
        author: {
          name: summary.response.players[0].personaname,
          icon_url: summary.response.players[0].avatarfull
        },
        fields: [
          {
            name: "Total Hours",
            value: `${Math.round(app.playtime_forever / 60)} Hours`,
            inline: true
          },
          {
            name: "Last Two Weeks",
            value: `${Math.round(app.playtime_2weeks / 60)} Hours`,
            inline: true
          }
        ],
        thumbnail: {
          url: `http://media.steampowered.com/steamcommunity/public/images/apps/${app.appid}/${app.img_logo_url}.jpg`
        }
      });
    }
  }
};
