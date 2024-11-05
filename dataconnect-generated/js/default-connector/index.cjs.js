const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'multiplayer-game',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

