const path = require("path");
const Client = require("./structure/Client");
const keys = require("../resource/config/keys");

const getPrefix = msg => {
  if (msg.guild) {
    return [
      msg.client.provider.get(
        "user",
        msg.author.id,
        "prefix",
        msg.client.prefix
      ),
      msg.client.provider.get(
        "guild",
        msg.guild.id,
        "prefix",
        msg.client.prefix
      ),
      msg.client.prefix
    ];
  }
  return [
    "",
    msg.client.provider.get("user", msg.author.id, "prefix", msg.client.prefix),
    msg.client.prefix
  ];
};

const client = new Client(
  {
    ownerID: "258328359040188418",
    handleEdits: true,
    allowMention: true,
    commandUtilLifetime: 300000,
    automateCategories: true,
    prefix: getPrefix,
    commandDirectory: path.join(__dirname, "./components/commands/"),
    inhibitorDirectory: path.join(__dirname, "./components/inhibitors/"),
    listenerDirectory: path.join(__dirname, "./components/listeners/")
  },
  {
    disableEveryone: true
  }
);

client.start({ discord: keys.discord, steam: keys.steam });
