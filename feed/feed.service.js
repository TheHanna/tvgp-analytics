// Imports
const fs = require('fs').promises
const RssParser = require('rss-parser')

// Service variables
const RSS_LOCAL_PATH = process.env.RSS_LOCAL_PATH
const RSS_URL = process.env.RSS_URL

class FeedService {
  constructor() {
    this.parser = new RssParser()
  }

  async _hasLocal() {
    const stats = await fs.stat(RSS_LOCAL_PATH)
    return stats && stats.isFile() && stats.size > 0
  }

  async _getLocal() {
    const data = await fs.readFile(RSS_LOCAL_PATH, { encoding: 'utf-8' })
    return await this.parser.parseString(data)
  }

  async _getRemote() {
    return await this.parser.parseURL(RSS_URL)
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
