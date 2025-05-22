// Copyright (c) 2025 Aadarsh Raj Kunwer
// Project: Apple Bot
// All rights reserved. Do not use, copy, modify, or distribute without permission.

const { Client, GatewayIntentBits } = require('discord.js');
const { ClusterClient } = require('discord-hybrid-sharding');
const { Kazagumo } = require('kazagumo');
const { SpotifyPlugin } = require('@kazagumo/spotify');
const { Connectors } = require('shoukaku');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.cluster = new ClusterClient(client);

const nodes = [
  {
    name: config.lavalink.name,
    url: config.lavalink.url,
    auth: config.lavalink.auth,
    secure: config.lavalink.secure,
  },
];

client.kazagumo = new Kazagumo(
  {
    plugins: [
      new SpotifyPlugin({
        clientId: config.spotify.clientId,
        clientSecret: config.spotify.clientSecret,
      }),
    ],
    defaultSearchEngine: 'spotify',
    send: (id, payload) => {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  nodes
);

client.commands = new Map();

const loadCommands = (dir) => {
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const command = require(path.join(dir, file));
    client.commands.set(command.data.name, command);
  }
};

loadCommands('./commands/');

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const name = args.shift()?.toLowerCase();
  const command = client.commands.get(name);
  if (command) command.execute(message, args);
});

client.once('ready', () => {
  console.log(`[Cluster ${client.cluster.id}] Logged in as ${client.user.tag}`);
});

client.login(config.token);
