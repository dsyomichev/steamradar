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
          let summary;
          try {
            summary = await this.GetPlayerSummaries({ steamids: user });
          } catch (err) {
            return reject(err);
          }
          if (summary.response.players.length == 0) return resolve(null);
          return resolve(user);
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
        let id = url.slice(3);
        try {
          id = await this.ResolveVanityURL({ vanityurl: id });
        } catch (err) {
          return reject(err);
        }
        return resolve(id.response.steamid);
      }
      if (user.match(/^[0-9]+$/) && user.length === 17) {
        let summary;
        try {
          summary = await this.GetPlayerSummaries({ steamids: user });
        } catch (err) {
          return reject(err);
        }
        if (summary.response.players.length == 0) return resolve(null);
        return resolve(user);
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
        if (url.substring(0, 10) == "/profiles/") return resolve(url.slice(10));
        console.log(url);
        let id = url.slice(3);
        try {
          id = await this.ResolveVanityURL({ vanityurl: id });
        } catch (err) {
          return reject(err);
        }
        return resolve(id.response.steamid);
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

  resolveGame(game) {
    return new Promise(async (resolve, reject) => {
      if (game.match(/^[0-9]+$/) && game.length === 6) {
        let storepage;
        try {
          storepage = await rp(`http://store.steampowered.com/api/appdetails?appids=${game}`);
        } catch (err) {
          return reject(err);
        }
        if (storepage[game].success == false) return resolve(null);
        return resolve(game);
      } else {
        let res;
        try {
          res = await rp(`http://store.steampowered.com/search/results/?term=${game}&category1=998%2C994`);
        } catch (err) {
          reject(err);
        }
        let $ = cheerio.load(res);
        let result = $(".search_result_row").attr("data-ds-appid");
        if (!result) return resolve(null);
        return resolve(result);
      }
    });
  }
  searchItem(name) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        result = JSON.parse(await rp(`http://steamcommunity.com/market/search/render/?query=${name}&start=0&count=1&norender=1`));
      } catch (err) {
        reject(err);
      }
      return resolve({
        name: result.results[0].name,
        icon: `http://community.edgecast.steamstatic.com/economy/image/${result.results[0].asset_description.icon_url}`,
        game: result.results[0].app_name,
        price: result.results[0].sell_price_text,
        listings: result.results[0].sell_listings,
        color: result.results[0].asset_description.name_color,
        order: result.results[0].sale_price_text
      });
    });
  }

  storePage(appid, location) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        result = JSON.parse(await rp(`http://store.steampowered.com/api/appdetails?appids=${appid}&cc=${location}`));
      } catch (err) {
        reject(err);
      }
      if (!result[appid].success) return resolve(null);
      return resolve(result);
    });
  }

  appReviews(appid) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        result = JSON.parse(await rp(`http://store.steampowered.com/appreviews/${appid}`));
      } catch (err) {
        reject(err);
      }
      let $ = cheerio.load(result.review_score);
      let review = $(".game_review_summary").attr("data-tooltip-text");
      return resolve(parseInt(review.substring(0, review.indexOf("%"))));
    });
  }

  storeNew(count) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        result = await rp("http://store.steampowered.com/search/results/?filter=popularnew&sort_by=Released_DESC");
      } catch (err) {
        reject(err);
      }
      let $ = cheerio.load(result);
      let links = $("#search_result_container div a").toArray();
      let images = $("#search_result_container div a .search_capsule img").toArray();
      let names = $("#search_result_container div a .responsive_search_name_combined .search_name .title").toArray();
      let prices = $("#search_result_container div a .responsive_search_name_combined .search_price")
        .map((i, e) => {
          return $(e)
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim();
        })
        .get();
      count = count ? (count > links.length ? links.length : count) : links.length;
      let games = [];
      for (let i = 0; i < count; i++) {
        games.push({
          appid: links[i].attribs["data-ds-appid"],
          link: links[i].attribs.href,
          img: images[i].attribs.src,
          name: names[i].children[0].data,
          price: prices[i]
        });
      }
      return resolve(games);
    });
  }
  storeTop(count) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        result = await rp("http://store.steampowered.com/search/results/?filter=topsellers");
      } catch (err) {
        reject(err);
      }
      let $ = cheerio.load(result);
      let links = $("#search_result_container div a").toArray();
      let images = $("#search_result_container div a .search_capsule img").toArray();
      let names = $("#search_result_container div a .responsive_search_name_combined .search_name .title").toArray();
      let prices = $("#search_result_container div a .responsive_search_name_combined .search_price")
        .map((i, e) => {
          return $(e)
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim();
        })
        .get();

      count = count ? (count > links.length ? links.length : count) : links.length;
      let games = [];
      for (let i = 0; i < count; i++) {
        games.push({
          appid: links[i].attribs["data-ds-appid"],
          link: links[i].attribs.href,
          img: images[i].attribs.src,
          name: names[i].children[0].data,
          price: prices[i]
        });
      }
      return resolve(games);
    });
  }
  storeUpcoming(count) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        result = await rp("http://store.steampowered.com/search/results/?filter=comingsoon");
      } catch (err) {
        reject(err);
      }
      let $ = cheerio.load(result);
      let links = $("#search_result_container div a").toArray();
      let images = $("#search_result_container div a .search_capsule img").toArray();
      let names = $("#search_result_container div a .responsive_search_name_combined .search_name .title").toArray();
      let dates = $("#search_result_container div a .responsive_search_name_combined .search_released").toArray();

      count = count ? (count > links.length ? links.length : count) : links.length;
      let games = [];
      for (let i = 0; i < count; i++) {
        games.push({
          appid: links[i].attribs["data-ds-appid"],
          link: links[i].attribs.href,
          img: images[i].attribs.src,
          name: names[i].children[0].data,
          date: dates[i].children[0].data
        });
      }
      return resolve(games);
    });
  }
  storeSale(count) {
    return new Promise(async (resolve, reject) => {
      let result;
      try {
        result = await rp("http://store.steampowered.com/search/results/?filter=topsellers");
      } catch (err) {
        reject(err);
      }
      let $ = cheerio.load(result);
      let links = $("#search_result_container div a").toArray();
      let images = $("#search_result_container div a .search_capsule img").toArray();
      let names = $("#search_result_container div a .responsive_search_name_combined .search_name .title").toArray();
      let prices = $("#search_result_container div a .responsive_search_name_combined .search_price")
        .map((i, e) => {
          return $(e)
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim();
        })
        .get();
      let discounts = $("#search_result_container div a .responsive_search_name_combined .search_price_discount_combined .search_discount span").toArray();
      count = count ? (count > links.length ? links.length : count) : links.length;
      let games = [];
      for (let i = 0; i < count; i++) {
        games.push({
          appid: links[i].attribs["data-ds-appid"],
          link: links[i].attribs.href,
          img: images[i].attribs.src,
          name: names[i].children[0].data,
          price: prices[i],
          discount: discounts[i].children[0].data
        });
      }
      return resolve(games);
    });
  }

  storeStats() {}
};
