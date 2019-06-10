// Imports
require('dotenv').config({ path: './config/.env' })
const fs = require('fs').promises
const FeedService = require('./feed/feed.service')
const EpisodeService = require('./episode/episode.service')
const feedService = new FeedService()
const episodeService = new EpisodeService()

// feedService.getSchema().then(schema => console.log(schema))

feedService.get()
  .then(feed => episodeService.filter(feed.items))
  .then(episodes => episodes.map(e => episodeService.parse(e)))
  .then(parsed => {
    parsed.forEach(async p => await fs.writeFile(`./data/${p.number}.html`, p.html))
  })
