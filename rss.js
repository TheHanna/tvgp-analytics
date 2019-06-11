// Imports
require('dotenv').config({ path: './config/.env' })
const Episode = require('./models').episode
const Host = require('./models').host
const EpisodeHost = require('./models').episodehost
const FeedService = require('./feed/feed.service')
const EpisodeService = require('./episode/episode.service')
const feedService = new FeedService()
const episodeService = new EpisodeService()

// feedService.getSchema().then(schema => console.log(schema))

function getHostIds(parsedHosts) {
  const promises = []
  parsedHosts.forEach(parsedHost => {
    promises.push(Host.findOne({ where: parsedHost }).then(host => ({ ...parsedHost, id: host.id })))
  })
  return Promise.all(promises)
}

function hostFinder(host, existingHost) {
  const firstNameMatch = host.firstName === existingHost.firstName
  const lastNameMatch = host.lastName === existingHost.lastName
  const displayNameMatch = host.displayName == existingHost.displayName
  return firstNameMatch && lastNameMatch && displayNameMatch
}

async function createHosts(parsedEpisodes) {
  const existingHosts = await Host.findAll()
  const hasHosts = existingHosts.length > 0
  let hosts = []
  parsedEpisodes.forEach(episode => hosts.push(...episode.hosts))
  hosts = Array.from(new Set(hosts))
  hosts = hosts.map(host => episodeService.parseHost(host))
  let unknownHosts = hasHosts ?
    hosts.reduce((acc, host) => {
      const found = existingHosts.find(existingHost => hostFinder(host, existingHost))
      if (!found) acc.push(host)
      return acc
    }, []) : hosts
  if (unknownHosts.length > 0) await Host.bulkCreate(unknownHosts)
  return await Host.findAll()
}

async function createEpisodes(parsedEpisodes) {
  const existingEpisodes = await Episode.findAll()
  const hasEpisodes = existingEpisodes.length > 0
  let episodes = []
  parsedEpisodes.forEach(episode => episodes.push({
    number: episode.number,
    title: episode.title,
    html: episode.html,
    description: episode.text,
    publishDate: episode.date,
    guid: episode.guid
  }))
  let unknownEpisodes = hasEpisodes ?
    episodes.reduce((acc, episode) => {
      const found = existingEpisodes.find(existingEpisode => episode.guid === existingEpisode.guid)
      if (!found) acc.push(episode)
      return acc
    }, []) : episodes
  if (unknownEpisodes.length > 0) await Episode.bulkCreate(unknownEpisodes)
  return await Episode.findAll()
}

async function createEpisodeHosts(parsedEpisodes) {
  const existingEpisodeHosts = await EpisodeHost.findAll()
  const hasEpisodeHosts = existingEpisodeHosts.length > 0
  let episodeHosts = []
  parsedEpisodes.forEach(episode => {
    episode.parsedHosts.forEach(parsedHost => episodeHosts.push({
      hostId: parsedHost.id,
      episodeId: episode.id
    }))
  })
  let unknownEpisodeHosts = hasEpisodeHosts ?
    episodeHosts.reduce((acc, episodeHost) => {
      const found = existingEpisodeHosts.find(existingEpisodeHost => {
        return episodeHost.hostId === existingEpisodeHost.hostId &&
          episodeHost.episodeId === existingEpisodeHost.episodeId
      })
      if (!found) acc.push(episodeHost)
      return acc
    }, []) : episodeHosts
  if (unknownEpisodeHosts.length > 0) await EpisodeHost.bulkCreate(unknownEpisodeHosts)
  return await EpisodeHost.findAll()
}

feedService.get()
  .then(feed => feed.items.reverse())
  .then(episodes => episodes.map(e => episodeService.parse(e)))
  .then(async parsedEpisodes => {
    console.log('Creating hosts...')
    const hosts = await createHosts(parsedEpisodes)
    console.log('Creating episodes...')
    const episodes = await createEpisodes(parsedEpisodes).catch(err => console.error('Ah, fuck!', err))
    // Map new ids to parsedHosts and episodes on our parsedEpisodes object
    parsedEpisodes.forEach(episode => {
      episode.id = episodes.find(e => episode.guid === e.guid).id
      episode.parsedHosts = episode.hosts.reduce((acc, host) => {
        const found = hosts.find(existingHost => hostFinder(episodeService.parseHost(host), existingHost))
        if (found) acc.push(found.dataValues)
        return acc
      }, [])
    })
    console.log('Associating episodes and hosts...')
    await createEpisodeHosts(parsedEpisodes)
  })
