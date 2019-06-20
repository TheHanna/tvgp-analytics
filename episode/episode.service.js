const db = require('../db')
const TABLE_NAME = 'episode'

class EpisodeService {
  episodeFinder (episode, knownEpisode) {
    return episode.guid === knownEpisode.guid
  }

  async getAll (columns) {
    return await db.select(columns).table(TABLE_NAME)
  }

  async getById (id) {
    return await db.select().where({ id }).table(TABLE_NAME)
  }

  async getEpisodesWithHosts (offset, limit) {
    const episodes = await db.select([ 'id', 'number', 'title' ])
      .from(TABLE_NAME)
      .offset(offset)
      .limit(limit)
    const episodeIds = episodes.map(e => e.id)
    const hosts = await db.from('episode_host')
      .select(['id', 'firstName', 'lastName', 'displayName'].map(a => `host.${a}`))
      .select('episode_host.episodeId')
      .whereIn('episodeId', episodeIds)
      .leftJoin('host', 'host.id', 'episode_host.hostId')
    return episodes.map(e => {
      e.hosts = hosts.filter(h => h.episodeId === e.id)
        .map(h => {
          delete h.episodeId
          h.fullName = h.displayName
            ? `${h.firstName} "${h.displayName}" ${h.lastName}`
            : `${h.firstName} ${h.lastName}`
          return h
        })
      delete e.id
      return e
    })
  }

  async getEpisodeWithHosts (id) {
    const episode = await db.select([ 'id', 'number', 'title' ])
      .from(TABLE_NAME)
      .where({ id })
      .first()
    const hosts = await db.from('episode_host')
      .select(['id', 'firstName', 'lastName', 'displayName'].map(a => `host.${a}`))
      .select('episode_host.episodeId')
      .where('episodeId', id)
      .leftJoin('host', 'host.id', 'episode_host.hostId')
    episode.hosts = hosts.filter(h => h.episodeId === episode.id)
      .map(h => {
        delete h.episodeId
        h.fullName = h.displayName
          ? `${h.firstName} "${h.displayName}" ${h.lastName}`
          : `${h.firstName} ${h.lastName}`
        return h
      })
    delete episode.id
    return episode
  }

  async hasEpisodes () {
    const episodes = await db(TABLE_NAME).count('id as total').first()
    return episodes.total > 0
  }

  async addEpisodes (episodes) {
    return await db.batchInsert(TABLE_NAME, episodes)
      .then(() => episodes.length)
      .catch(error => { throw new Error(error) })
  }

  async getUnknownEpisodes (episodes) {
    const knownEpisodes = await this.getAll()
    return episodes.reduce((unknowns, episode) => {
      const found = knownEpisodes.find(knownEpisode => this.episodeFinder(episode, knownEpisode))
      if (!found) unknowns.push(episode)
      return unknowns
    }, [])
  }

  async createEpisodes (episodes) {
    const hasEpisodes = await this.hasEpisodes()
    const unknownEpisodes = hasEpisodes ? this.getUnknownEpisodes(episodes) : episodes
    const hasEpisodesToCreate = unknownEpisodes.length > 0
    return hasEpisodesToCreate
      ? await this.addEpisodes(unknownEpisodes)
      : 0
  }
}

module.exports = EpisodeService
