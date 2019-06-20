const router = require('express').Router()
const service = new (require('./episode.service'))()

router.get('/episodes', async (req, res) => {
  const offset = parseInt(req.query.offset, 10) || 0
  const limit = parseInt(req.query.limit, 10) || 25
  const episodes = await service.getEpisodesWithHosts(offset, limit)
  res.status(200).send(episodes)
})

router.get('/episode/:id', async (req, res) => {
  const episode = await service.getEpisodeWithHosts(req.params.id)
  res.status(200).send(episode)
})

module.exports = { router }
