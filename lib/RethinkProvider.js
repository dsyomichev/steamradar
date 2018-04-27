module.exports = class RethinkProvider {
  constructor({ host = "127.0.0.1", port = 28015, db = "bot", tables = ["guilds"], index = "settings", config = false } = {}) {
    this.r = require("rethinkdbdash")({
      servers: [{ host, port }],
      silent: true
    });

    Object.defineProperty(this, "client", {
      value: null,
      writable: true
    });

    this.structure = { db, tables, index };

    for (let table of tables) this[table] = new Map();
    if (config) this.config = true;
  }
  async init() {
    let dbList = await this.r.dbList();
    if (!dbList.includes(this.structure.db)) throw new Error(`Database ${this.structure.db} does not exist.`);
    let tableList = await this.r.db(this.structure.db).tableList();
    for (let tableName of this.structure.tables) {
      if (!tableList.includes(tableName)) throw new Error(`Table ${tableName} does not exist.`);
      let table = await this.r.db(this.structure.db).table(tableName);
      for (let row of table) {
        if (typeof row[this.structure.index] != "object" || !row.settings) {
          console.log(`RethinkProvider: Settings for document ${row.id} are not a valid object.`);
          continue;
        }
        this[tableName].set(row.id, row.settings);
      }
    }
    return;
  }

  destroy() {
    return this.r.getPool().drain();
  }

  get(table, id, key, def) {
    if (this.config && table == "config") {
      return new Promise(resolve => {
        let config = this.r.db(this.structure.db).table("config");
        return resolve(id ? config[id] : config);
      });
    }
    if (!this[table]) throw new Error(`Table ${table} is not a valid table.`);
    let settings = this[table].get(id);
    return settings ? (settings[key] ? settings[key] : def) : def;
  }

  async set(table, id, key, val) {
    if (this.config && table == "config") {
      await this.r
        .db(this.structure.db)
        .table("config")
        .insert({ key: id, value: key }, { conflict: "update" });
      return;
    }
    if (!this[table]) throw new Error(`Table ${table} is not a valid table.`);
    let settings = this[table].get(id) || {};
    settings[key] = val;
    this[table].set(id, settings);
    let object = { id };
    object[this.structure.index] = settings;
    await this.r
      .db(this.structure.db)
      .table(table)
      .insert(object, { conflict: "update" });
    return;
  }

  async remove(table, id, key) {
    if (!this[table]) throw new Error(`Table ${table} is not a valid table.`);
    let settings = this[table].get(id) || {};
    if (!settings[key]) return;
    delete settings[key];
    let object = {};
    object[this.structure.index] = settings;
    await this.r
      .db(this.structure.db)
      .table(table)
      .get(id)
      .update(object);
    return;
  }
  async clear(table, id) {
    if (!this[table]) throw new Error(`Table ${table} is not a valid table.`);
    this[table].set(id, {});
    let object = {};
    object[this.structure.index] = {};
    await this.r
      .db(this.structure.db)
      .table(table)
      .get(id)
      .update(object);
    return;
  }
};
