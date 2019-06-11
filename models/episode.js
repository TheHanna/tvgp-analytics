'use strict';
module.exports = (sequelize, DataTypes) => {
  const episode = sequelize.define('episode', {
    number: DataTypes.INTEGER,
    title: DataTypes.STRING,
    html: DataTypes.TEXT,
    description: DataTypes.TEXT,
    publishDate: DataTypes.DATE,
    guid: DataTypes.STRING,
  }, {});
  episode.associate = function(models) {
    // associations can be defined here
  };
  return episode;
};