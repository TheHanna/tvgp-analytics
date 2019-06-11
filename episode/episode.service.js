const $ = require('cheerio')
const MAIN_PREFIX = 'TVGP Episode'
const SECONDARY_PREFIX = 'Episode'

class EpisodeService {
  constructor() { }
  _hasName(title) { return title.split(':').length > 1 }
  _isMain(title) { return (title.startsWith(MAIN_PREFIX) || title.startsWith(SECONDARY_PREFIX)) && this._hasName(title) }

  filter(episodes) {
    const filtered = episodes.reverse().filter(e => this._isMain(e.title))
    return filtered
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
    return parseInt(parts[parts.length - 1], 10)
  }

  parseContent(content) {
    const $html = $.load(content)
    $html('object').remove()
    const $body = $html('body').first()
    const text = $body.text().replace(/\n/gi, '').trim()
    const html = $body.html().replace(/\n/gi, '').trim()
    const hosts = this.parseHosts(text)
    return {
      text,
      html,
      hosts
    }
  }

  parseHosts(text) {
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

  parseHost(hostString) {
    const hostParts = hostString.split(' ')
    const host = {}
    if (hostParts.length === 3) {
      host.firstName = hostParts[0]
      host.lastName = hostParts[2]
      host.displayName = hostParts[1].replace(/"/gmi, '')
    } else if (hostParts.length) {
      host.firstName = hostParts[0]
      host.lastName = hostParts[1]
    }
    return host
    // return await Host.findOrCreate({ where: host, defaults: host }).then(result => result[0])

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
