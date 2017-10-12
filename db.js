const Sequelize = require('sequelize');
const db = new Sequelize('tvgpData', null, null, {
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: './db/tvgp-data.db',
  operatorsAliases: false
});

module.exports = db;
