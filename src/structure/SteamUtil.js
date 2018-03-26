const rp = require("request-promise");
const cheerio = require("cheerio");

const SteamQuery = require("../../lib/SteamQuery");

module.exports = class SteamUtil extends require("../../lib/SteamAPI") {
  constructor({ key, sessionid, jar }) {
    super(key);
    this.sessionid = sessionid;
    this.jar = jar;
    this.query = new SteamQuery();
  }

  resolveUser(user) {
    return new Promise(async (resolve, reject) => {
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
};
