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
  return host
    ? res.status(200).send(host)
    : res.status(404).send(`Host with id ${req.params.id} not found`)
})

module.exports = { router }
