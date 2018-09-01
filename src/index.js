const { ShardingManager } = require("discord.js");
const manager = new ShardingManager("./shard.js");

manager.spawn(/* number of shards */);
