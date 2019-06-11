const express = require('express')
const api = require('./api')
const app = express()
const port = 3000

app.get('/', (req, res) => res.sendStatus(404))
app.get('/episodes', async (req, res) => {
  const episodes = await api.getEpisodes()
  res.status(200).send(episodes)
})
app.get('/hosts', async (req, res) => {
  const hosts = await api.getHosts()
  res.status(200).send(hosts)
})

app.listen(port, err => err ? console.log(err) : console.log(`server is listening on port ${port}`))
