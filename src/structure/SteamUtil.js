const rp = require("request-promise");
const cheerio = require("cheerio");
const tough = require("tough-cookie");
const path = require("path");

const SteamQuery = require(path.resolve("lib/SteamQuery"));

module.exports = class SteamUtil extends require(path.resolve("lib/SteamAPI")) {
  constructor({ key, sessionid, jar }) {
    super(key);
    this.query = new SteamQuery();
  }

  async init() {
    return new Promise(async (resolve, reject) => {
      let res;
      try {
        res = await rp({
          uri: "http://steamcommunity.com",
          method: "GET",
          resolveWithFullResponse: true
        });
      } catch (err) {
        return reject(`Unable to receive session key. | ${err}`);
      }

      let cookiestring = res.headers["set-cookie"][0];
      let sessionid = cookiestring.substring(10, cookiestring.indexOf(";"));
      let cookie = tough.Cookie.parse(cookiestring);
      let jar = rp.jar();
      jar.setCookie(cookie, "http://steamcommunity.com");

      this.sessionid = sessionid;
      this.jar = jar;

      return resolve();
    });
  }

  resolveUser(user, input) {
    return new Promise(async (resolve, reject) => {
      if (input == "id") {
        if (user.match(/^[0-9]+$/) && user.length === 17) {
          resolve(user);
        } else {
          let res;
          try {
            res = await this.ResolveVanityURL({ vanityurl: user });
          } catch (err) {
            return reject(err);
          }
          if (res.response.success == 1) return resolve(res.response.steamid);
          return resolve(null);
        }
      } else if (input == "username") {
        let res;
        try {
          res = JSON.parse(
            await rp({
              uri: "http://steamcommunity.com/search/SearchCommunityAjax",
              qs: {
                sessionid: this.sessionid,
                text: user
              },
              method: "GET",
              jar: this.jar
            })
          );
        } catch (err) {
          return reject(err);
        }
        if (res.search_result_count == 0) return resolve(null);
        let $ = cheerio.load(res.html);
        let url = $("div.avatarMedium a").attr("href");
        url = url.slice(26);
        if (url.substring(0, 9) == "profiles/") return resolve(url.slice(9));
        return resolve(url.slice(3));
      }
      if (user.match(/^[0-9]+$/) && user.length === 17) {
        resolve(user);
      } else {
        let res;
        try {
          res = await this.ResolveVanityURL({ vanityurl: user });
        } catch (err) {
          return reject(err);
        }
        if (res.response.success == 1) return resolve(res.response.steamid);
        res = null;
        try {
          res = JSON.parse(
            await rp({
              uri: "http://steamcommunity.com/search/SearchCommunityAjax",
              qs: {
                sessionid: this.sessionid,
                text: user
              },
              method: "GET",
              jar: this.jar
            })
          );
        } catch (err) {
          return reject(err);
        }
        if (res.search_result_count == 0) return resolve(null);
        let $ = cheerio.load(res.html);
        let url = $("div.avatarMedium a").attr("href");
        url = url.slice(26);
        if (url.substring(0, 9) == "profiles/") return resolve(url.slice(9));
        return resolve(url.slice(3));
      }
    });
  }

  resolveState(state) {
    if (state === 0) {
      return "Offline";
    } else if (state === 1) {
      return "Online";
    } else if (state === 2) {
      return "Busy";
    } else if (state === 3) {
      return "Away";
    } else if (state === 4) {
      return "Snooze";
    } else if (state === 5) {
      return "Looking to Trade";
    } else if (state === 6) {
      return "Looking to Play";
    }
  }

  resolvePrivacy(privacy) {
    if (privacy == 1) return true;
    return false;
  }
};
