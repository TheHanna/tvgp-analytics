// Imports
require('dotenv').config({ path: './config/.env' })
const sequelize = require('./models').sequelize
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

async function createHosts(parsedEpisodes) {
  let hosts = []
  parsedEpisodes.forEach(episode => hosts.push(...episode.hosts))
  hosts = Array.from(new Set(hosts))
  hosts = hosts.map(host => episodeService.parseHost(host))
  return await sequelize.transaction(async t => {
    const promises = []
    hosts.forEach(host => promises.push(Host.findOrCreate({ where: host, defaults: host, transaction: t })))
    return await Promise.all(promises).then(hosts => hosts.map(host => host[0]))
  }).catch(err => console.error('Ah, shit!', err))
}

async function createEpisodes(parsedEpisodes) {
  let episodes = []
  parsedEpisodes.forEach(episode => episodes.push({
    number: episode.number,
    title: episode.title,
    html: episode.html,
    description: episode.text,
    publishDate: episode.date,
    guid: episode.guid
  }))
  return await sequelize.transaction(async t => {
    const promises = []
    episodes.forEach(episode => promises.push(Episode.findOrCreate({ where: { guid: episode.guid }, defaults: episode, transaction: t })))
    return await Promise.all(promises).then(episodes => episodes.map(episode => episode[0]))
  }).catch(err => console.error('Ah, shit!', err))
}

async function createEpisodeHosts(parsedEpisodes) {
  let episodeHostPromises = []
  let hostIdPromises = []
  parsedEpisodes.forEach(async episode => {
    hostIdPromises.push(getHostIds(episode.parsedHosts))
  })
  const hostsWithIds = await Promise.all(hostIdPromises)
  return await sequelize.transaction(async t => {
    hostsWithIds.forEach((hosts, i) => {
      const episode = parsedEpisodes[i];
      hosts.forEach(host => {
        const episodeHost = { hostId: host.id, episodeId: episode.id }
        episodeHostPromises.push(EpisodeHost.findOrCreate({ where: episodeHost, defaults: episodeHost, transaction: t }))
      })
    })
    return await Promise.all(episodeHostPromises).then(episodeHosts => episodeHosts.map(episodeHost => episodeHost[0]))
  }).catch(err => console.error('Ah, shit!', err))
}

feedService.get()
  .then(feed => episodeService.filter(feed.items))
  .then(episodes => episodes.map(e => episodeService.parse(e)))
  .then(async parsedEpisodes => {
    console.log('Creating hosts...')
    const hosts = await createHosts(parsedEpisodes)
    console.log('Creating episodes...')
    const episodes = await createEpisodes(parsedEpisodes)
    parsedEpisodes.forEach(episode => {
      episode.id = episodes.find(e => episode.guid === e.guid).id
      episode.parsedHosts = episode.hosts.map(host => episodeService.parseHost(host))
    })
    console.log('Associating episodes and hosts...')
    const episodeHosts = await createEpisodeHosts(parsedEpisodes)
  })
