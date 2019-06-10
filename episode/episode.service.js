const $ = require('cheerio')
const MAIN_PREFIX = 'TVGP Episode'

class EpisodeService {
  constructor() { }
  _hasName(title) { return title.split(':').length > 1 }
  _isMain(title) { return title.startsWith(MAIN_PREFIX) && this._hasName(title) }

  filter(episodes) {
    return episodes.reverse().filter(e => this._isMain(e.title))
  }

  parseTitle(title) {
    const parts = title.split(':').map(t => t.trim())
    return {
      title: parts[1],
      number: this.parseNumber(parts[0]),
    }
  }

  parseNumber(prefix) {
    const parts = prefix.split(' ').map(p => p.trim())
    return parseInt(parts[2], 10)
  }

  parseContent(content) {
    const $html = $.load(content)
    const $body = $html('body').first()
    const text = $body.text().replace(/\n/gi, '').trim()
    const html = $body.html().replace(/\n/gi, '').trim()
    return {
      text,
      html
    }
  }
  
  parse(episode) {
    const parsedTitle = this.parseTitle(episode.title)
    const parsedDescription = this.parseContent(episode.content)
    return {
      ...parsedTitle,
      date: episode.isoDate,
      ...parsedDescription,
      guid: episode.guid
    }
  }
}

module.exports = EpisodeService
