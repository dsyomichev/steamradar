const { Guild, User } = require("discord.js");

module.exports = class RethinkProvider {
  /**
   *Create the Database connection.
   * @param {String} host The address of the server the Rethink database is running on.
   * @param {Number} port The port of the server the Rethink database is running on.
   */
  constructor(host = "localhost", port = 28015) {
    this.r = require("rethinkdbdash")({
      servers: [{ host: host, port: port }],
      silent: true
    });

    Object.defineProperty(this, "client", {
      value: null,
      writable: true
    });

    /**
     * Settings cached in memory, mapped by guild ID (or 'global')
     * @type {Map}
     * @private
     */
    this.guild = new Map();
    /**
     * Settings cached in memory, mapped by user ID (or 'global')
     * @type {Map}
     * @private
     */
    this.user = new Map();
  }

  /**
   * Initiate the database to have all the required databases and tables.
   */
  init() {
    return new Promise(async (resolve, reject) => {
      let dlist = await this.r.dbList();
      if (!dlist.includes("bot")) {
        await this.r.dbCreate("bot");
      }
      let tlist = await this.r.db("bot").tableList();
      if (!tlist.includes("guild")) {
        await this.r.db("bot").tableCreate("guild", { primaryKey: "id" });
      }
      if (!tlist.includes("user")) {
        await this.r.db("bot").tableCreate("user", { primaryKey: "id" });
      }

      let uilist = await this.r
        .db("bot")
        .table("user")
        .indexList();
      if (!uilist.includes("settings")) {
        await this.r
          .db("bot")
          .table("user")
          .indexCreate("settings");
      }
      let gilist = await this.r
        .db("bot")
        .table("guild")
        .indexList();
      if (!gilist.includes("settings")) {
        await this.r
          .db("bot")
          .table("guild")
          .indexCreate("settings");
      }

      let grows = await this.r.db("bot").table("guild");
      for (let row of grows) {
        let settings;
        if (typeof row.settings !== "object" || row.settings === null) {
          console.log(`RethinkProvider: Settings for guild ${row.id} are not an Object`);
          continue;
        }
        settings = row.settings;

        let guild = row.id;
        this.guild.set(guild, settings);
      }
      let urows = await this.r.db("bot").table("user");
      for (let row of urows) {
        let settings;
        if (typeof row.settings !== "object" || row.settings === null) {
          console.log(`RethinkProvider: Settings for user ${row.id} are not an Object`);
          continue;
        }
        settings = row.settings;

        let user = row.id;
        this.user.set(user, settings);
      }

      resolve();
    });
  }

  /**
   * Ends the connection to the Database.
   */
  destroy() {
    return this.r.getPool().drain();
  }

  /**
   * Retrieve a value from the settings object in the database.
   * @param {String} table Either guild or user, to specify which table to search for settings in.
   * @param {Guild | User | String} id A guild, user or an ID representing on of the two.
   * @param {String} key The key of the value being retrieved.
   * @param {String} def Default value to return if the value is not found.
   */
  get(table, id, key, def) {
    let settings;
    if (table == "guild") {
      settings = this.guild.get(this.guildId(id));
    } else if (table == "user") {
      settings = this.user.get(this.userId(id));
    } else {
      throw new TypeError("Not a table, use `guild` or `user`");
    }
    return settings ? (typeof settings[key] !== "undefined" ? settings[key] : def) : def;
  }

  /**
   * Set a value in the settings object in the database.
   * @param {String} table Either guild or user, to specify which table to search for settings in.
   * @param {User | Guild | String} id A guild, user or an ID representing on of the two.
   * @param {String} key The key of the value being set.
   * @param {String} val The value of the key being set.
   */
  set(table, id, key, val) {
    return new Promise(async (resolve, reject) => {
      let settings;
      if (table == "guild") {
        id = this.guildId(id);
        settings = this.guild.get(id) || {};
        settings[key] = val;
        this.guild.set(id, settings);
      } else if (table == "user") {
        id = this.userId(id);
        settings = this.user.get(id) || {};
        settings[key] = val;
        this.user.set(id, settings);
      } else {
        return reject("Not a table, use `guild` or `user`!");
      }
      let check = await this.r
        .db("bot")
        .table(table)
        .getAll(id)
        .count()
        .eq(1);
      if (check == false) {
        await this.r
          .db("bot")
          .table(table)
          .insert({ id: id, settings: settings });
        return resolve();
      } else {
        await this.r
          .db("bot")
          .table(table)
          .get(id)
          .replace({ id: id, settings: settings });
        return resolve();
      }
    });
  }

  /**
   * Remove a value from the settings object.
   * @param {String} table Either guild or user, to specify which table to search for settings in.
   * @param {User | Guild | String} id A guild, user or an ID representing on of the two.
   * @param {String} key The key of the value being removed.
   */
  remove(table, id, key) {
    return new Promise(async (resolve, reject) => {
      let settings;
      if (table == "guild") {
        id = this.guildId(id);
        settings = this.guild.get(id);
      } else if (table == "user") {
        id = this.userId(id);
        settings = this.user.get(id);
      } else {
        return reject("Not a table, use `guild` or `user`");
      }
      if (!settings || typeof settings[key] === "undefined") return resolve();

      delete settings[key];
      await this.r
        .db("bot")
        .table(table)
        .get(id)
        .replace({ id: id, settings: settings });
      return resolve();
    });
  }

  /**
   * Clear all settings from a guild.
   * @param {String} table Either guild or user, to specify which table to search for settings in.
   * @param {User | Guild | String} id A guild, user or an ID representing on of the two.
   */
  clear(table, id) {
    return new Promise(async (resolve, reject) => {
      if (table == "guild") {
        id = this.guildId(id);
        if (!this.guild.has(id)) reject("That guild does not have any settings.");
        this.user.delete(id);
        id = id == "global" ? "0" : id;
      } else if (table == "user") {
        id = this.userId(id);
        if (!this.user.has(id)) reject("That user does not have any settings.");
        this.user.delete(id);
        id = id == "global" ? "0" : id;
      } else {
        return reject("Not a table, use guild or user!");
      }
      await this.r
        .db("bot")
        .table(table)
        .get(id)
        .replace({ id: id, settings: {} });
      resolve();
    });
  }

  /**
   * Obtains the ID of the provided guild, or throws an error if it isn't valid
   * @param {Guild|string} guild - Guild to get the ID of
   * @return {string} ID of the guild, or 'global'
   */
  guildId(guild) {
    if (guild instanceof Guild) return guild.id;
    if (guild === "global" || guild === null) return "0";
    if (typeof guild === "string" && !isNaN(guild)) return guild;
    throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
  }

  /**
   * Obtains the ID of the provided guild, or throws an error if it isn't valid
   * @param {Guild|string} guild - Guild to get the ID of
   * @return {string} ID of the guild, or 'global'
   */
  userId(user) {
    if (user instanceof User) return user.id;
    if (user === "global" || user === null) return "0";
    if (typeof user === "string" && !isNaN(user)) return user;
    throw new TypeError('Invalid user specified. Must be a User instance, user ID, "global", or null.');
  }
};
