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
