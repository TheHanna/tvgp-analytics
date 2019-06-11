'use strict';
module.exports = (sequelize, DataTypes) => {
  const host = sequelize.define('host', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    displayName: {
      type:DataTypes.STRING,
      nullable: true
    }
  }, {});
  host.associate = function(models) {
    host.belongsToMany(models.episode, { through: models.episodehost, as: 'hosts' })
    host.belongsToMany(models.episode, { through: models.episodehost, as: 'episodes' })
  };
  return host;
};