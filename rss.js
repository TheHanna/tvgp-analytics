// Imports
require('dotenv').config({ path: './config/.env' })
const fs = require('fs').promises
const Episode = require('./models').episode
const EpisodeHost = require('./models').episodehost
const pretty = require('pretty')
const FeedService = require('./feed/feed.service')
const EpisodeService = require('./episode/episode.service')
const feedService = new FeedService()
const episodeService = new EpisodeService()

// feedService.getSchema().then(schema => console.log(schema))

feedService.get()
  .then(feed => episodeService.filter(feed.items))
  .then(episodes => episodes.map(e => episodeService.parse(e)))
  .then(async parsed => {
    parsed.forEach(async p => {
      await fs.writeFile(`./data/html/${p.number.toString().padStart(3, '0')}.html`, pretty(p.html))
      const hosts = await Promise.all(p.hosts.map(async h => await episodeService.parseHost(h).then(parsed => parsed.id)))
      const episode = await Episode.findOrCreate({ where: {
        number: p.number,
        title: p.title,
        html: p.html,
        description: p.text,
        publishDate: p.date,
        guid: p.guid
      }}).then(e => e[0])
      // console.log(episode.id, hosts)
      await hosts.forEach(async host => {
        console.log(episode.id, host)
        await EpisodeHost.findOrCreate({
          where: { episodeId: episode.id, hostId: host },
          defaults: { episodeId: episode.id, hostId: host }
        })
      })
    })
  })
