const dgram = require("dgram");
const bp = require("bufferpack");

module.exports = class SteamQuery {
  /**
   * Creates a new UDP client and sets the timeout.
   * @param {Object} settings An object containing settings, currently only supporting a custom timeout.
   */
  constructor(settings) {
    settings = settings || {};
    this.timeout = settings.timeout || 1000;
    this.client = dgram.createSocket("udp4");
  }

  /**
   * Sends the buffer to the server.
   * @param {Buffer} buffer The buffer to send to the server.
   * @param {string} address The IPV4 address to send the packet to.
   * @param {number} port The port on the address to send the packet to.
   * @param {string} code The header code to check the integrity of the packet.
   */
  send(buffer, address, port, code) {
    return new Promise((resolve, reject) => {
      let client = this.client;
      if (!buffer) {
        reject("Missing buffer to send.");
        return;
      }
      if (!address) {
        reject("Missing address to send to.");
        return;
      }
      if (!port) {
        reject("Missing port of host to send to.");
        return;
      }
      if (!code) {
        reject("Missing header code of respnse to check.");
        return;
      }
      client.send(buffer, 0, buffer.length, port, address, (err, bytes) => {
        if (err) {
          reject(err);
          return;
        }
        let response = (buffer, remote) => {
          if (remote.address != address || remote.port != port) {
            reject("Received response from invalid server.");
          }
          if (buffer.length < 1) {
            reject("Missing buffer in response.");
          }
          buffer = buffer.slice(4);
          if (bp.unpack("<s", buffer)[0] !== code) {
            reject("Invalid response header.");
          }
          client.removeListener("message", response);
          clearTimeout(timeout);
          buffer = buffer.slice(1);
          resolve(buffer);
          return;
        };
        let timeout = setTimeout(() => {
          reject("Connection timed out.");
          client.removeListener("message", response);
        }, this.timeout);

        client.on("message", response);
      });
    });
  }

  /**
   * Gets basic information about the source server.
   * @param {string} address The IPV4 address of the server.
   * @param {number} port The port of the server.
   */
  info(address, port) {
    return new Promise(async (resolve, reject) => {
      let buffer;
      try {
        buffer = await this.send(
          bp.pack("<isS", [-1, "T", "Source Engine Query"]),
          address,
          port,
          "I"
        );
      } catch (err) {
        reject(err);
        return;
      }
      let list = bp.unpack("<bSSSShBBBssBB", buffer);
      let keys = [
        "protocol",
        "name",
        "map",
        "folder",
        "game",
        "appid",
        "playersnum",
        "maxplayers",
        "botsnum",
        "servertype",
        "environment",
        "visibility",
        "vac"
      ];
      let info = {};
      for (let i = 0; i < list.length; i++) {
        info[keys[i]] = list[i];
      }
      let offset = bp.calcLength("<bSSSShBBBssBB", list);
      buffer = buffer.slice(offset);
      info.version = bp.unpack("<S", buffer)[0];
      offset = bp.calcLength("<S", [info.version]);
      buffer = buffer.slice(offset);
      if (buffer.length > 1) {
        offset = 0;
        let EDF = bp.unpack("<b", buffer)[0];
        offset += 1;
        if ((EDF & 0x80) !== 0) {
          info.port = bp.unpack("<h", buffer, offset)[0];
          offset += 2;
        }
        if ((EDF & 0x10) !== 0) {
          info.steamID = bp.unpack("<ii", buffer, offset)[0];
          offset += 8;
        }
        if ((EDF & 0x40) !== 0) {
          let tvinfo = bp.unpack("<hS", buffer, offset);
          info["tv-port"] = tvinfo[0];
          info["tv-name"] = tvinfo[1];
          offset += bp.calcLength("<hS", tvinfo);
        }
        if ((EDF & 0x20) !== 0) {
          info.keywords = bp.unpack("<S", buffer, offset)[0];
          offset += bp.calcLength("<S", info.keywords);
        }
        if ((EDF & 0x01) !== 0) {
          info.gameID = bp.unpack("<i", buffer, offset)[0];
          offset += 4;
        }
      }
      resolve(info);
    });
  }

  /**
   *  A challenge request to send before querying for players of rules.
   * @param {string} address The IPV4 address of the server.
   * @param {number} port The port of the server.
   */
  challenge(address, port, code) {
    return new Promise(async (resolve, reject) => {
      let buffer;
      try {
        buffer = await this.send(
          bp.pack("<isi", [-1, code, -1]),
          address,
          port,
          "A"
        );
      } catch (err) {
        reject(err);
        return;
      }
      let number = bp.unpack("<i", buffer)[0];
      resolve(number);
    });
  }

  /**
   * Gets the players connected to the source server.
   * @param {string} address The IPV4 address of the server.
   * @param {number} port The port of the server.
   */
  players(address, port) {
    return new Promise(async (resolve, reject) => {
      let key;
      try {
        key = await this.challenge(address, port, "U");
      } catch (err) {
        reject(err);
        return;
      }
      let buffer;
      try {
        buffer = await this.send(
          bp.pack("<isi", [-1, "U", key]),
          address,
          port,
          "D"
        );
      } catch (err) {
        reject(err);
        return;
      }
      let count = bp.unpack("<B", buffer)[0];
      let offset = 1;
      let players = [];
      let keys = ["index", "name", "score", "duration"];
      for (let i = 0; i < count; i++) {
        let list = bp.unpack("<bSif", buffer, offset);
        let player = {};
        for (let i = 0; i < list.length; i++) {
          player[keys[i]] = list[i];
        }
        offset += bp.calcLength("<bSif", list);
        players.push(player);
      }
      resolve(players);
    });
  }

  /**
   * Gets the rules of the source server.
   * @param {string} address The IPV4 address of the server.
   * @param {number} port The port of the server.
   */
  rules(address, port) {
    return new Promise(async (resolve, reject) => {
      let key;
      try {
        key = await this.challenge(address, port, "V");
      } catch (err) {
        reject(err);
        return;
      }
      let buffer;
      try {
        buffer = await this.send(
          bp.pack("<isi", [-1, "V", key]),
          address,
          port,
          "E"
        );
      } catch (err) {
        reject(err);
        return;
      }
      let count = bp.unpack("<h", buffer)[0];
      let rules = [];
      let keys = ["name", "value"];
      let offset = 2;
      for (let i = 0; i < count; i++) {
        let list = bp.unpack("<SS", buffer, offset);
        let rule = {};
        for (let i = 0; i < list.length; i++) {
          rule[keys[i]] = list[i];
        }
        rules.push(rule);
        offset += bp.calcLength("<SS", list);
      }
      resolve(rules);
    });
  }

  /**
   * Destroys the client, preventing further requests.
   */
  destroy() {
    this.client.close();
  }
};