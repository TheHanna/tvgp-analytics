require('dotenv').config({ path: './config/.env' })
const FeedService = require('../feed/feed.service')
const HostService = require('../host/host.service')
const EpisodeService = require('../episode/episode.service')
const EpisodeHostService = require('../episode-host/episode-host.service')
const feedService = new FeedService()
const hostService = new HostService()
const episodeService = new EpisodeService()
const episodeHostService = new EpisodeHostService()

async function createHosts (items) {
  const hosts = items ? items.flatMap(i => i.hosts) : []
  console.log('Creating hosts...')
  const hostsCreated = await hostService.createHosts(hosts)
  console.log(`\t-> Created ${hostsCreated} new hosts`)
}

async function createEpisodes (items) {
  const episodes = items ? items.map(i => i.episode) : []
  console.log('Creating episodes...')
  const episodesCreated = await episodeService.createEpisodes(episodes)
  console.log(`\t-> Created ${episodesCreated} new episodes`)
}

async function createEpisodeHosts (items) {
  const processedItems = items.map(i => Object.assign({}, i, { parsedHosts: i.hosts.map(hostService.parseHostString) }))
  console.log('Creating host<->episode relationships...')
  const hostEpisodesCreated = await episodeHostService.createEpisodeHosts(processedItems)
  console.log(`\t-> Created ${hostEpisodesCreated} host<->episode relationships`)
}

feedService.get()
  .then(feed => feedService.getNew(feed.items.reverse()))
  .then(newItems => newItems ? newItems.map(i => feedService.parseItem(i)) : null)
  .then(items => !items ? console.log('No new items to process') : items)
  .then(async items => {
    await createHosts(items)
    await createEpisodes(items)
    await createEpisodeHosts(items)
  })
