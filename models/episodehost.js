'use strict';
module.exports = (sequelize, DataTypes) => {
  const episodehost = sequelize.define('episodehost', {
    hostId: DataTypes.INTEGER,
    episodeId: DataTypes.INTEGER
  }, {});
  episodehost.associate = function(models) {
    // associations can be defined here
  };
  return episodehost;
};