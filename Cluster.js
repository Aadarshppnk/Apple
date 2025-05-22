// Copyright (c) 2025 Aadarsh Raj Kunwer
// Project: Apple Bot
// All rights reserved. Do not use, copy, modify, or distribute without permission.

const { ClusterManager } = require('discord-hybrid-sharding');
const path = require('path');
const config = require('./config.json');

const manager = new ClusterManager(path.resolve(__dirname, './bot.js'), {
  totalShards: 'auto',
  totalClusters: 'auto',
  mode: 'process',
  token: config.token,
});

manager.on('clusterCreate', cluster => {
  console.log(`[Cluster Manager] Launched Cluster #${cluster.id}`);
});

manager.spawn({ timeout: -1 });
