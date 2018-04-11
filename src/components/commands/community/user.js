const path = require("path");
const moment = require("moment");
module.exports = class UserCommand extends require(path.resolve("src/structure/Command")) {
  constructor() {
    super("user", {
      aliases: ["user"],
      description: "Search for a user by SteamID64, CustomURL ID, or username.",
      format: "user [(SteamID) OR (CustomID) OR (Username)]",
      examples: ["user carrotstress -i", "user 76561198205315656", "user Grumpy Cat --username"],
      api: true,
      details: "Search for a user by SteamID64, CustomURL ID, or username.",
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

  async exec(msg, { user, id, username }) {
    msg.util.searching();
    if (!user) return msg.util.deny({ title: "Default ID not set.", description: "You need to set a default ID before using this command without an input." });
    let steamid;
    if (id) steamid = await this.client.steam.resolveUser(user, "id");
    else if (username) steamid = await this.client.steam.resolveUser(user, "username");
    else steamid = await this.client.steam.resolveUser(user);
    if (!steamid) return msg.util.deny({ title: "User not found.", description: "The ID or username provided did not point to any Steam user." });

    let requests = {
      summary: await this.client.steam.GetPlayerSummaries({ steamids: steamid }).catch(err => {}),
      bans: await this.client.steam.GetPlayerBans({ steamids: steamid }).catch(err => {}),
      friends: this.client.steam.GetFriendList({ steamid, relationship: "friend" }).catch(err => {}),
      recent: this.client.steam.GetRecentlyPlayedGames({ steamid, count: 3 }).catch(err => {}),
      owned: this.client.steam.GetOwnedGames({ steamid }).catch(err => {}),
      level: this.client.steam.GetSteamLevel({ steamid }).catch(err => {})
    };

    let summary = requests.summary.response.players[0];
    let bans = requests.bans.players[0];

    summary.personastate = this.client.steam.resolveState(summary.personastate);
    summary.private = summary.communityvisibilitystate == 3 ? false : true;
    if (summary.private) {
      return msg.util.embed({
        author: {
          name: summary.personaname,
          icon_url: summary.avatarfull
        },
        fields: [
          {
            name: "User Information",
            value: `**Privacy State**: Private\n**Status**: ${summary.personastate}`,
            inline: true
          },
          {
            name: "SteamID",
            value: `**SteamID64**: ${summary.steamid}\n**SteamID32**: ${summary.steamid - 76561197960265728}`,
            inline: true
          },
          {
            name: "Bans",
            value: `**Community**: ${bans.CommunityBanned ? msg.util.emoji.yes : msg.util.emoji.no} | **VAC**: ${
              bans.VACBanned ? msg.util.emoji.yes : msg.util.emoji.no
            } | **Trade**: ${bans.EconomyBan != "none" ? msg.util.emoji.yes : msg.util.emoji.no}`
          }
        ],
        title: summary.profileurl,
        color: msg.util.colors.confirm,
        thumbnail: { url: summary.avatarfull },
        footer: { text: `Last logged off ${moment.unix(summary.lastlogoff).fromNow()}.` }
      });
    } else {
      let level = await requests.level;
      level = level.response.player_level;
      let friends = await requests.friends;
      friends = friends.friendslist.friends;
      let recent = await requests.recent;
      recent = recent.response.games;
      let owned = await requests.owned;
      owned = owned.response.game_count || "None";

      let recently_played = "";
      if (recent) {
        for (let game of recent) {
          recently_played += `${game.name}\n`;
        }
      }
      recently_played = recently_played || "None\n\u200b";

      let player_info = {
        country: summary.loccountrycode ? `${this.normalizeCC(summary.loccountrycode)} :flag_${summary.loccountrycode.toLowerCase()}:` : "Not Set",
        real_name: summary.realname || "Not Set",
        playing: summary.gameextrainfo || "None",
        friend_count: friends.length,
        level,
        game_count: owned,
        recently_played
      };

      return msg.util.embed({
        author: {
          name: summary.personaname,
          icon_url: summary.avatarfull
        },
        fields: [
          {
            name: "User Information",
            value: `**Privacy State**: Public\n**Status**: ${summary.personastate}\n**Level**: ${player_info.level}\n**Real Name**: ${player_info.real_name}\n**Country**: ${
              player_info.country
            }\n**Playing**: ${player_info.playing}\n**Friends**: ${player_info.friend_count}\n**Games**: ${player_info.game_count}\n\u200b`,
            inline: true
          },
          {
            name: "SteamID",
            value: `**SteamID64**: ${summary.steamid}\n**SteamID32**: ${summary.steamid - 76561197960265728}\n\u200b`,
            inline: true
          },
          {
            name: "Recently Played",
            value: `${recently_played}\u200b`
          },
          {
            name: "Bans",
            value: `**Community** : ${bans.CommunityBanned ? msg.util.emoji.yes : msg.util.emoji.no}   |   **VAC** : ${
              bans.VACBanned ? msg.util.emoji.yes : msg.util.emoji.no
            }  |   **Trade** : ${bans.EconomyBan != "none" ? msg.util.emoji.yes : msg.util.emoji.no}  \n\u200b`
          }
        ],
        title: summary.profileurl,
        color: msg.util.colors.confirm,
        thumbnail: { url: summary.avatarfull },
        footer: { text: `Last logged off ${moment.unix(summary.lastlogoff).fromNow()}.` }
      });
    }
  }
};
