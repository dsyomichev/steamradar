const rp = require("request-promise");
const qs = require("querystring");

module.exports = class SteamAPI {
  constructor(key) {
    this.key = key;
    this.baseURI = "https://api.steampowered.com";
    this.format = "json";
  }

  request(settings = {}, { service = false, post = false }) {
    return new Promise(async (resolve, reject) => {
      if (!settings.path) return reject("Missing path for request.");
      let uri = this.baseURI + settings.path + "?";
      delete settings.path;
      if (service == true) {
        uri += qs.stringify({
          input_json: JSON.stringify(settings),
          format: this.format,
          key: this.key
        });
      } else {
        settings.format = this.format;
        settings.key = this.key;
        uri += qs.stringify(settings);
      }
      let result;
      try {
        result = JSON.parse(
          await rp({
            uri: uri,
            method: post ? "POST" : "GET"
          })
        );
      } catch (err) {
        reject(err);
      }
      return resolve(result);
    });
  }

  //\\--------------------------Regular Interfaces---------------------------//\\

  //ISteamUser
  GetFriendsList(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      params.path = "/ISteamUser/GetFriendList/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetPlayerBans(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamids) return reject("Missing Param | steamids");
      if (typeof params.steamids == "object" && !params.steamids.length)
        return reject("Param steamids should be a string or array.");
      if (typeof params.steamids == "object" && params.steamids.length > 100)
        return reject("Too Many SteamIDs");
      if (typeof params.steamids == "object")
        params.steamids = params.steamids.join(",");
      params.path = "/ISteamUser/GetPlayerBans/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetPlayerSummaries(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamids) return reject("Missing Param | steamids");
      if (typeof params.steamids == "object" && !params.steamids.length)
        return reject("Param steamids should be a string or array.");
      if (typeof params.steamids == "object" && params.steamids.length > 100)
        return reject("Too Many SteamIDs");
      if (typeof params.steamids == "object")
        params.steamids = params.steamids.join(",");
      params.path = "/ISteamUser/GetPlayerSummaries/v0002/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetUserGroupList(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      params.path = "/ISteamUser/GetUserGroupList/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  ResolveVanityURL(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.vanityurl) return reject("Missing Param | vanityurl");
      if (typeof params.vanityurl != "string")
        return reject("Invalid Param | vanityurl");
      if (params.url_type && params.url_type < 1 && params.url_type > 3)
        return reject("Invalid Param | url_type");
      params.path = "/ISteamUser/ResolveVanityURL/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //ISteamUserStats
  GetGlobalAchievementPercentagesForApp(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.gameid) return reject("Missing Param | gameid");
      if (typeof params.gameid != "string" && typeof params.gameid != "number")
        return reject("Invalid Param | gameid");
      params.path =
        "/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetGlobalStatsForGame(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.appid) return reject("Missing Param | appid");
      if (!params.count) return reject("Missing Param | count");
      if (!params.name) return reject("Missing Param | name");
      if (typeof params.name != "object" && !params.name.length)
        return reject("Invalid Param | name");
      for (let i = 0; i < params.name.length; i++) {
        params[`name[${i}]`] = params.name[i];
      }
      delete params.name;
      params.path = "/ISteamUserStats/GetGlobalStatsForGame/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetNumberOfCurrentPlayers(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.appid) return reject("Missing Param | appid");
      params.path = "/ISteamUserStats/GetNumberOfCurrentPlayers/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetPlayerAchievements(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      if (!params.appid) return reject("Missing Param | appid");
      params.path = "/ISteamUserStats/GetPlayerAchievements/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetSchemaForGame(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.appid) return reject("Missing Param | appid");
      params.path = "/ISteamUserStats/GetSchemaForGame/v2/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetUserStatsForGame(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      if (!params.appid) return reject("Missing Param | appid");
      params.path = "/ISteamUserStats/GetUserStatsForGame/v2/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //ISteamWebAPIUtil
  GetServerInfo() {
    return new Promise(async (resolve, reject) => {
      let params = {};
      params.path = "/ISteamWebAPIUtil/GetServerInfo/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetSupportedAPIList() {
    return new Promise(async (resolve, reject) => {
      let params = {};
      params.path = "/ISteamWebAPIUtil/GetSupportedAPIList/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //ISteamUserAuth
  AuthenticateUser(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      if (!params.sessionkey) return reject("Missing Param | sessionkey");
      if (!params.encrypted_loginkey)
        return reject("Missing Param | encrypted_loginkey");
      params.path = "/ISteamUserAuth/AuthenticateUser/v1/";
      let response;
      try {
        response = await this.request(params, { post: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  AuthenticateUserTicket(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.appid) return reject("Missing Param | appid");
      if (!params.ticket) return reject("Missing Param | ticket");
      params.path = "/ISteamUserAuth/AuthenticateUserTicket/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //ISteamApps
  GetAppList() {
    return new Promise(async (resolve, reject) => {
      let params = {};
      params.path = "/ISteamApps/GetAppList/v2/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetServersAtAddress(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.addr) return reject("Missing Param | addr");

      params.path = "/ISteamApps/GetServersAtAddress/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  UpToDateCheck(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.appid) return reject("Missing Param | appid");
      if (!params.version) return reject("Missing Param | version");
      params.path = "/ISteamApps/UpToDateCheck/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //ISteamEconomy
  GetAssetClassInfo(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.appid) return reject("Missing Param | appid");
      if (!params.class_count) return reject("Missing Param | class_count");
      if (!params.classid0) return reject("Missing Param | classid0");
      params.path = "/ISteamEconomy/GetAssetClassInfo/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetAssetPrices(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.appid) return reject("Missing Param | appid");
      params.path = "/ISteamEconomy/GetAssetPrices/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //ISteamNews
  GetNewsForApp(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.appid) return reject("Missing Param | appid");
      params.path = "/ISteamNews/GetNewsForApp/v2/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //ISteamRemoteStorage
  GetCollectionDetails(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.collectioncount)
        return reject("Missing Param | collectioncount");
      if (!params.publishedfileids)
        return reject("Missing Param | publishedfileids");
      if (
        typeof params.publishedfileids != "object" &&
        !params.publishedfileids.length
      )
        return reject("Invalid Param | publishedfileids");
      for (let i = 0; i < params.publishedfileids.length; i++) {
        params[`publishedfileids[${i}]`] = params.publishedfileids[i];
      }
      delete params.publishedfileids;
      params.path = "/ISteamRemoteStorage/GetCollectionDetails/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetPublishedFileDetails(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.itemcount) return reject("Missing Param | itemcount");
      if (!params.publishedfileids)
        return reject("Missing Param | publishedfileids");
      if (
        typeof params.publishedfileids != "object" &&
        !params.publishedfileids.length
      )
        return reject("Invalid Param | publishedfileids");
      for (let i = 0; i < params.publishedfileids.length; i++) {
        params[`publishedfileids[${i}]`] = params.publishedfileids[i];
      }
      delete params.publishedfileids;
      params.path = "/ISteamRemoteStorage/GetPublishedFileDetails/v1/";
      let response;
      try {
        response = await this.request(params, { post: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetUGCFileDetails(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.ugcid) return reject("Missing Param | ugcid");
      if (!params.appid) return reject("Missing Param | appid");
      params.path = "/ISteamRemoteStorage/GetUGCFileDetails/v1/";
      let response;
      try {
        response = await this.request(params);
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //\\--------------------------Service Interfaces---------------------------//\\

  //IPlayerService
  RecordOfflinePlaytime(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      if (!params.ticket) return reject("Missing Param | ticket");
      if (!params.play_sessions) return reject("Missing Param | play_sessions");
      params.path = "/IPlayerService/RecordOfflinePlaytime/v1/";
      let response;
      try {
        response = await this.request(params, { service: true, post: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetOwnedGames(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      params.path = "/IPlayerService/RecordOfflinePlaytime/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetRecentlyPlayedGames(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      if (!params.count) return reject("Missing Param | count");
      params.path = "/IPlayerService/GetRecentlyPlayedGames/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetSteamLevel(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      params.path = "/IPlayerService/GetSteamLevel/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetBadges(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      params.path = "/IPlayerService/GetBadges/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetCommunityBadgeProgress(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      params.path = "/IPlayerService/GetCommunityBadgeProgress/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  IsPlayingSharedGame(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.steamid) return reject("Missing Param | steamid");
      if (!params.appid_playing) return reject("Missing Param | appid_playing");
      params.path = "/IPlayerService/IsPlayingSharedGame/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  //IEconService
  GetTradeHistory(params = {}) {
    return new Promise(async (resolve, reject) => {
      s;
      params.path = "/IEconService/GetTradeHistory/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetTradeOffers(params = {}) {
    return new Promise(async (resolve, reject) => {
      params.path = "/IEconService/GetTradeHistory/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetTradeOffer(params = {}) {
    return new Promise(async (resolve, reject) => {
      params.path = "/IEconService/GetTradeOffer/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetTradeOffersSummary(params = {}) {
    return new Promise(async (resolve, reject) => {
      params.path = "/IEconService/GetTradeOffersSummary/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  GetTradeOffersSummary(params = {}) {
    return new Promise(async (resolve, reject) => {
      params.path = "/IEconService/GetTradeOffersSummary/v1/";
      let response;
      try {
        response = await this.request(params, { service: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  DeclineTradeOffer(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.tradeofferid) return reject("Missing Param | tradeofferid");
      params.path = "/IEconService/DeclineTradeOffer/v1/";
      let response;
      try {
        response = await this.request(params, { service: true, post: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }

  CancelTradeOffer(params = {}) {
    return new Promise(async (resolve, reject) => {
      if (!params.tradeofferid) return reject("Missing Param | tradeofferid");
      params.path = "/IEconService/CancelTradeOffer/v1/";
      let response;
      try {
        response = await this.request(params, { service: true, post: true });
      } catch (err) {
        return reject(err);
      }
      return resolve(response);
    });
  }
};
