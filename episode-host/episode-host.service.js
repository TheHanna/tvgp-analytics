const db = require('../db')
const HostService = require('../host/host.service')
const EpisodeService = require('../episode/episode.service')
const TABLE_NAME = 'episode_host'
const hostService = new HostService()
const episodeService = new EpisodeService()

class EpisodeHostService {
  async getAll () {
    return await db.select().table(TABLE_NAME)
  }

  async getById (id) {
    return await db.select().where({ id }).table(TABLE_NAME)
  }

  async hasAssociations () {
    const associations = await db(TABLE_NAME).count('id as total').first()
    return associations.total > 0
  }

  async addAssociations (associations) {
    return await db.batchInsert(TABLE_NAME, associations)
      .then(async () => associations.length)
      .catch(error => { throw new Error(error) })
  }

  async mapIdsToParsedItems (feedItems) {
    const hosts = await hostService.getAll()
    const episodes = await episodeService.getAll()
    return feedItems.map(item => {
      const newItem = Object.assign({}, item)
      const foundEpisode = episodes.find(e => episodeService.episodeFinder(newItem.episode, e))
      newItem.episode.id = foundEpisode.id
      newItem.parsedHosts.forEach(host => {
        const foundHost = hosts.find(h => hostService.hostFinder(host, h))
        host.id = foundHost.id
      })
      return newItem
    })
  }

  buildAssociations (feedItems) {
    const associations = []
    feedItems.forEach(item => {
      const hosts = item.parsedHosts
      const episodeId = item.episode.id
      const association = hosts.map(h => ({ hostId: h.id, episodeId }))
      associations.push(...association)
    })
    return associations
  }

  async getUnknownAssociations (associations) {
    const knownAssociations = await this.getAll()
    return associations.reduce((unknowns, association) => {
      const found = knownAssociations.find(knownAssociation => this.associationFinder(association, knownAssociation))
      if (!found) unknowns.push(association)
      return unknowns
    }, [])
  }

  async createEpisodeHosts (feedItems) {
    const mappedItems = await this.mapIdsToParsedItems(feedItems)
    const hasAssociations = await this.hasAssociations()
    const associations = this.buildAssociations(mappedItems)
    const unknownAssociations = hasAssociations ? this.getUnknownAssociations(associations) : associations
    const hasAssociationsToCreate = unknownAssociations.length > 0
    return hasAssociationsToCreate
      ? await this.addAssociations(unknownAssociations)
      : 0
  }
}

module.exports = EpisodeHostService
