const path = require("path");
require("./components/startup")(path.join(__dirname, "../resource/config"));
const log = require("./components/log");
const Client = require("./components/client");
const prefix = require("../resource/config/config").settings.prefix;
const token = require("../resource/config/keys").discord;

const getPrefix = msg => {
  if (msg.guild) {
    return [
      msg.client.provider.get("user", msg.author.id, "prefix", prefix),
      msg.client.provider.get("guild", msg.guild.id, "prefix", prefix),
      prefix
    ];
  }
  return [
    "",
    msg.client.provider.get("user", msg.author.id, "prefix", prefix),
    prefix
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

client.setProvider();
client.login(token);
