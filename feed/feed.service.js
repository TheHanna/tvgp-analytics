// Imports
const fs = require('fs').promises
const got = require('got')
const cheerio = require('cheerio')
const RssParser = require('rss-parser')
const EpisodeService = require('../episode/episode.service')
const episodeService = new EpisodeService()

// Service variables
const RSS_LOCAL_PATH = process.env.RSS_LOCAL_PATH
const RSS_URL = process.env.RSS_URL
const MAIN_PREFIX = 'TVGP Episode'
const SECONDARY_PREFIX = 'Episode'

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

  _hasName(title) { return title.split(':').length > 1 }
  _isMain(title) { return (title.startsWith(MAIN_PREFIX) || title.startsWith(SECONDARY_PREFIX)) && this._hasName(title) }

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
  
  parseHosts (text) {
    const hostsPattern = /(?:hosts:|hosted by:|featuring:)(.*)Running/gi
    const hostsMatches = hostsPattern.exec(text)
    let hostsString = hostsMatches ? hostsMatches[1] : ''
    hostsString = hostsString.replace(/(?:“|”)/gmi, '"')
    hostsString = hostsString.replace(/official azerothian correspondent:/gmi, ',')
    hostsString = hostsString.replace(/programmer at loose cannon stuios/gmi, ',')
    hostsString = hostsString.replace(/ from the carousel podcast/gmi, ',')
    hostsString = hostsString.replace(/(?:monthly)?\s?special guests?(?:\/cameraman)?:/gmi, ',')
    hostsString = hostsString.replace(/\s?cameraman:\s?/gmi, ',')
    hostsString = hostsString.replace(/\s?co-hosts?:\s?/gmi, ',')
    hostsString = hostsString.replace(/,? and /gmi, ',')
    hostsString = hostsString.replace(/\s?,\s?/gmi, ',')
    hostsString = hostsString.replace(/john knoblach/gmi, 'John "Knobs" Knoblach')
    hostsString = hostsString.replace(/John(\s*)?"Knob"(\s*)?Knoblach/gmi, 'John "Knobs" Knoblach')
    hostsString = hostsString.replace(/monkey senior/gmi, 'MonkeySenior')
    hostsString = hostsString.replace(/([^\s])"(\w)/gmi, '$1" $2')
    let hostsArr = hostsString.split(',')
      .filter(h => h !== '')
      .map(h => {
        h = h.trim()
        h = h.replace(/Michael "Boston"$/gmi, 'Michael "Boston" Hannon')
        h = h.replace(/Paul "Moonpir" Smith/gmi, 'Paul "Moonpir" Carver-Smith')
        h = h.replace(/Nintendork327/gmi, 'Scott "Nintendork" Jeffries')
        return h
      })
    return hostsArr
  }

  parseContent(content) {
    const $ = cheerio.load(content)
    $('object').remove()
    const $body = $('body').first()
    const description = $body.text().replace(/\n/gi, '').trim()
    const html = $body.html().replace(/\n/gi, '').trim()
    const hosts = this.parseHosts(description)
    return { description, html, hosts }
  }

  parseNumber(prefix) {
    const parts = prefix.split(' ').map(p => p.trim())
    return parseInt(parts[parts.length - 1], 10)
  }

  parseTitle(title) {
    const parts = title.split(':').map(t => t.trim())
    return { title: parts[1], number: this.parseNumber(parts[0]) }
  }

  async get() {
    const local = await this._hasLocal()
    return local ? await this._getLocal() : await this._getRemote()
  }

  async getNew (feedItems) {
    const knownGuids = await episodeService.getAll(['guid']).then(episodes => episodes.map(e => e.guid))
    const unknownItems = feedItems.reduce((unknowns, item) => {
      const known = knownGuids.includes(item.guid)
      if (!known) unknowns.push(item)
      return unknowns
    }, [])
    return unknownItems
  }

  async getSchema() {
    const feed = await this.get()
    return this._mapSchema(feed)
  }

  parseItem(feedItem) {
    const title = this.parseTitle(feedItem.title)
    const description = this.parseContent(feedItem.content)
    const hosts = description.hosts
    delete description.hosts
    return {
      episode: { ...title, ...description, publishDate: feedItem.isoDate, guid: feedItem.guid },
      hosts
    }
  }
}

module.exports = FeedService
