// Imports
const fs = require('fs').promises
const got = require('got')
const cheerio = require('cheerio')
const RssParser = require('rss-parser')

// Service variables
const RSS_LOCAL_PATH = process.env.RSS_LOCAL_PATH
const RSS_URL = process.env.RSS_URL
const MAIN_PREFIX = 'TVGP Episode'

const replacements = [
  { guid: 'a1f6644af710bade0a67d72c2f173f25', find: '433', replace: '443' },
  { guid: 'e35fe859787c4f25f9e84aa1ffc0ef13', find: 'Episode', replace: 'TVGP Episode' },
  { guid: '9016ac9c34ee47d891c89628090e8a8e', find: '257v2', replace: '257' }
]

const removals = [ '605954fa848658fc49258c27b170ff1b', 'bab170c18e7fe869b68076007f434b02' ]

class FeedService {
  constructor() {
    this.parser = new RssParser()
  }

  _fixFeedErrors(xmlString) {
    const $ = cheerio.load(xmlString, { xmlMode: true })
    const getByGuid = guid => $('item').find(`guid:contains('${guid}')`).parent('item')
    const getTitle = item => $(item).find('title')
    // Replacements
    replacements.forEach(r => {
      const item = getByGuid(r.guid)
      const title = getTitle(item)
      const fixedTitle = title.text().replace(r.find, r.replace)
      title.text(fixedTitle)
    })
    // Removals
    removals.forEach(guid => getByGuid(guid).remove())
    // Trim to just main TVGP episodes
    $('item').each((i, item) => getTitle(item).text().startsWith(MAIN_PREFIX) ? null : $(item).remove())
    // Return altered feed
    return $.html({ xmlMode: true })
  }

  async _hasLocal() {
    const stats = await fs.stat(RSS_LOCAL_PATH).catch(() => null)
    return stats && stats.isFile() && stats.size > 0
  }

  async _getLocal() {
    const data = await fs.readFile(RSS_LOCAL_PATH, { encoding: 'utf-8' })
    return await this.parser.parseString(data)
  }

  async _getRemote() {
    const data = await got(RSS_URL, { headers: { 'content-type': 'text/xml' } })
    const fixedData = this._fixFeedErrors(data.body)
    await fs.writeFile(RSS_LOCAL_PATH, fixedData)
    return await this._getLocal()
  }

  _getKeys(object) {
    const isArray = Array.isArray(object)
    const isObject = typeof object === 'object'
    const keys = Object.keys(object)
    const hasKeys = keys.length > 0
    return !isArray && isObject && hasKeys ? keys : null
  }

  _mapSchema(object) {
    const schema = {}
    for (let key in object) {
      const value = object[key]
      const keys = this._getKeys(value)
      const isArray = Array.isArray(value)
      if (isArray) {
        schema[key] = value.map(v => this._mapSchema(v))
      } else {
        schema[key] = keys ? this._mapSchema(value) : value.constructor.name
      }
    }
    return schema
  }

  async get() {
    const local = await this._hasLocal()
    return local ? await this._getLocal() : await this._getRemote()
  }

  async getSchema() {
    const feed = await this.get()
    return this._mapSchema(feed)
  }
}

module.exports = FeedService
