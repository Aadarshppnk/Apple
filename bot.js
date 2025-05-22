// Copyright (c) 2025 Aadarsh Raj Kunwer
// Project: Apple Bot
// All rights reserved. Do not use, copy, modify, or distribute without permission.

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { Kazagumo } = require("kazagumo");
const Spotify = require("@kazagumo/spotify");
const { Connectors } = require("shoukaku");
const { readdirSync } = require("fs");
const { join } = require("path");
const { nodes, spotify, prefix, token } = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandFolder = join(__dirname, "commands");
for (const folder of readdirSync(commandFolder)) {
  const files = readdirSync(join(commandFolder, folder)).filter(file => file.endsWith(".js"));
  for (const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.name) client.commands.set(command.name, command);
  }
}

const kazagumo = new Kazagumo(
  {
    defaultSearchEngine: "spotify",
    send: (id, payload) => {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    },
    plugins: [
      new Spotify({
        clientId: spotify.clientId,
        clientSecret: spotify.clientSecret
      })
    ]
  },
  new Connectors.DiscordJS(client),
  nodes
);

client.kazagumo = kazagumo;

client.on("messageCreate", async message => {
  if (!message.guild || message.author.bot) return;

  const content = message.content.trim();

  if (content.toLowerCase() === "botping" || content === prefix) {
    return message.reply(`My prefix is \`${prefix}\`. Use \`${prefix}help\` to see available commands.`);
  }

  if (!content.startsWith(prefix)) return;

  const args = content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift()?.toLowerCase();
  const command = client.commands.get(cmdName);
  if (command) {
    try {
      await command.execute(client, message, args);
    } catch (err) {
      console.error(err);
      message.reply("There was an error executing that command.");
    }
  }
});

require("./plugins/player")(client);

client.login(token);
