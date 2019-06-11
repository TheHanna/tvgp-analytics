require('dotenv').config({ path: './config/.env' })
const fs = require('fs').promises
const url = require('url')

const nodeEnv = process.env.NODE_ENV
const dbUrl = process.env.CLEARDB_DATABASE_URL
let config = {}

if (dbUrl) {
  const parsedUrl = url.parse(dbUrl)
  const authParts = parsedUrl.auth.split(':')
  config.username = authParts[0]
  config.password = authParts[1]
  config.database = parsedUrl.pathname.substr(1)
  config.host = parsedUrl.host
  config.dialect = parsedUrl.protocol.slice(0, -1)
  const data = { [nodeEnv]: config }
  fs.writeFile(process.env.DB_CONFIG_PATH, JSON.stringify(data)).then(result => console.log(result))
} else {
  fs.readFile(process.env.DB_CONFIG_EXAMPLE_PATH, 'utf-8').then(res => {
    fs.writeFile(process.env.DB_CONFIG_PATH, res)
  })
}