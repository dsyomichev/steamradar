const fs = require("fs");
const path = require("path");
const rls = require("readline-sync");
const log = require("./log");

module.exports = dir => {
  if (!dir || !fs.existsSync(dir)) throw new Error("Invalid config directory.");
  if (fs.existsSync(path.join(dir, "keys.json")) == false) {
    discord = rls.question("     >> Discord Token: ", {
      hideEchoBack: true
    });
    steam = rls.question("     >> Steam Key: ", {
      hideEchoBack: true
    });
    let lists = {};
    lists.dbl = rls.question("     >> DBL Token: ", {
      hideEchoBack: true
    });
    lists.bpw = rls.question("     >> BPW Token: ", {
      hideEchoBack: true
    });
    fs.writeFileSync(
      path.join(dir, "keys.json"),
      JSON.stringify({
        discord: discord,
        steam: steam,
        lists: lists
      })
    );
  }
};
