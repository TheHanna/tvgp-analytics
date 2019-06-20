const router = require('express').Router()
const service = new (require('./host.service'))()

router.get('/hosts', async (req, res) => {
  const offset = parseInt(req.query.offset, 10) || 0
  const limit = parseInt(req.query.limit, 10) || 25
  const hosts = await service.getHostsWithEpisodes(offset, limit)
  res.status(200).send(hosts)
})

router.get('/hosts/:id', async (req, res) => {
  const host = await service.getHostWithEpisodes(req.params.id)
  res.status(200).send(host)
})

module.exports = { router }
