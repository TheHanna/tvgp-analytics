const models = require('./models')

async function getHosts() {
  return await models.host.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    include: [{
      model: models.episode, as: 'episodes', attributes: ['id', 'number', 'title'], through: { attributes: [] }
    }]
  })
}

async function getEpisodes() {
  return await models.episode.findAll({
    attributes: ['number', 'title'],
    include: [{
      model: models.host, as: 'hosts', attributes: { exclude: [ 'createdAt', 'updatedAt' ] }, through: { attributes: [] }
    }]
  })
}

module.exports = { getHosts, getEpisodes }
