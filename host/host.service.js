const db = require('../db')
const TABLE_NAME = 'host'

class HostService {
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
    return await db.select().where({ id }).table(TABLE_NAME)
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
      ? this.getUnknownHosts(hosts)
      : this.getUniqueHosts(hosts)
    const hasHostsToCreate = unknownHosts.length > 0
    return hasHostsToCreate
      ? await this.addHosts(unknownHosts)
      : 0
  }
}

module.exports = HostService
