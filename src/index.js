const path = require("path");
const Client = require(path.resolve("src/structure/Client"));

const getPrefix = msg => {
  let def = msg.client.defaults.prefix;
  if (msg.channel.type == "text") {
    return [msg.client.provider.get("user", msg.author.id, "prefix", def), msg.client.provider.get("guild", msg.guild.id, "prefix", def), def];
  }
  return ["", msg.client.provider.get("user", msg.author.id, "prefix", def), def];
};

const client = new Client(
  {
    ownerID: "258328359040188418",
    handleEdits: true,
    commandUtil: true,
    allowMention: true,
    commandUtilLifetime: 300000,
    automateCategories: true,
    prefix: getPrefix,
    commandDirectory: path.resolve("src/components/commands/"),
    inhibitorDirectory: path.resolve("src/components/inhibitors/"),
    listenerDirectory: path.resolve("src/components/listeners/"),
    logDirectory: path.resolve("logs"),
    configDirectory: path.resolve("res/config"),
    dataDirectory: path.resolve("res/data")
  },
  {
    disableEveryone: true
  }
);

client.start(require(path.resolve("res/config/keys"))).then(() => client.postGuilds().then(() => setInterval(() => client.postGuilds(), 60000)));
