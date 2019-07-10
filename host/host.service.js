const db = require('../db')
const TABLE_NAME = 'host'

class _HostService {
  hostFinder (host, knownHost) {
    const firstNameMatch = host.firstName === knownHost.firstName
    const lastNameMatch = host.lastName === knownHost.lastName
    const displayNameMatch = host.displayName == knownHost.displayName
    return firstNameMatch && lastNameMatch && displayNameMatch
  }

  async getAll (columns) {
    return await db.select(columns).table(TABLE_NAME)
  }

  async getById (id) {
    return await db.select()
      .from(TABLE_NAME)
      .where({ id })
      .first()
  }

  async getByEpisodeId (episodeId) {
    return await db.from('episode_host')
      .select('host.*')
      .where({ episodeId })
      .leftJoin('host', 'host.id', 'episode_host.hostId')
  }

  async getHostsWithEpisodes (offset, limit) {
    const hosts = await db.select(['id', 'firstName', 'lastName', 'displayName'])
      .from(TABLE_NAME)
      .offset(offset)
      .limit(limit)
    const hostIds = hosts.map(h => h.id)
    const episodes = await db.from('episode_host')
      .select(['id', 'number', 'title'].map(a => `episode.${a}`))
      .select('episode_host.hostId')
      .whereIn('hostId', hostIds)
      .leftJoin('episode', 'episode.id', 'episode_host.episodeId')
    return hosts.map(h => {
      h.fullName = h.displayName
        ? `${h.firstName} "${h.displayName}" ${h.lastName}`
        : `${h.firstName} ${h.lastName}`
      h.episodes = episodes.filter(e => e.hostId === h.id)
        .map(e => {
          delete e.hostId
          return e
        })
      return h
    })
  }

  async getHostWithEpisodes (id) {
    if (!id) return
    const host = await db.select(['id', 'firstName', 'lastName', 'displayName'])
      .from(TABLE_NAME)
      .where({ id })
      .first()
      .catch(error => { throw new Error(error) })
    if (!host) return
    const episodes = await db.from('episode_host')
      .select(['id', 'number', 'title'].map(a => `episode.${a}`))
      .select('episode_host.hostId')
      .where('hostId', id)
      .leftJoin('episode', 'episode.id', 'episode_host.episodeId')
    host.episodes = episodes.filter(e => e.hostId === host.id)
      .map(e => {
        delete e.hostId
        return e
      })
    return host
  }

  async hasHosts () {
    const hosts = await db(TABLE_NAME).count('id as total').first()
    return hosts.total > 0
  }

  async addHosts (hosts) {
    return await db.batchInsert(TABLE_NAME, hosts)
      .then(async () => hosts.length)
      .catch(error => { throw new Error(error) })
  }

  parseHostString(hostString) {
    const hostParts = hostString.split(' ')
    const host = {}
    if (hostParts.length === 3) {
      host.firstName = hostParts[0]
      host.lastName = hostParts[2]
      host.displayName = hostParts[1].replace(/"/gmi, '')
    } else if (hostParts.length) {
      host.firstName = hostParts[0]
      host.lastName = hostParts[1]
    }
    return host
  }

  getUniqueHosts (hosts) {
    const uniqueHosts = new Set(hosts)
    return Array.from(uniqueHosts).map(this.parseHostString)
  }

  async getUnknownHosts (hosts) {
    const uniqueHosts = this.getUniqueHosts(hosts)
    const knownHosts = await this.getAll()
    return uniqueHosts.reduce((unknowns, host) => {
      const found = knownHosts.find(knownHost => this.hostFinder(host, knownHost))
      if (!found) unknowns.push(host)
      return unknowns
    }, [])
  }

  async createHosts (hosts) {
    const hasHosts = await this.hasHosts()
    const unknownHosts = hasHosts
      ? await this.getUnknownHosts(hosts)
      : this.getUniqueHosts(hosts)
    const hasHostsToCreate = unknownHosts.length > 0
    return hasHostsToCreate
      ? await this.addHosts(unknownHosts)
      : 0
  }
}

const HostService = new _HostService()

export { HostService }
