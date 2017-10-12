const rp = require('request-promise');
const cheerio = require('cheerio');
const Sequelize = require('sequelize');
const db = require('./db');
const moment = require('moment');

// Default options for scraper
const options = {
  url: 'http://tvgp.tv',
  transform: function(body) {
    return cheerio.load(body);
  }
};

// Episode model
const Episode = db.define('episode', {
  title: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.DATEONLY
  },
  url: {
    type: Sequelize.TEXT
  },
  metadata: {
    type: Sequelize.TEXT
  }
});

let more;

function get(url) {
  if (url) options.url = url;
  rp(options).then(data => {
    // Get all posts on the page
    data('.post').each((i, e) => {
      // Get the relevant data
      let title = data(e).find('.entry-title').text();
      let date = moment(data(e).find('.entry-date').text(), 'MMMM D, YYYY');
      let url = data(e).find('.powerpress_link_d').attr('href');
      let metadata = []

      data(e).find('.entry-content p:not([class])').each((i, e) => {
        metadata.push(data(e).text());
      });

      console.log('=====EPISODE=====');
      console.log(title);
      console.log(date.format('YYYY-MM-DD'));
      console.log(url);
      console.log(metadata.join('\n'));
      Episode.sync().then(() => {
        return Episode.create({
          title: title,
          date: date,
          url: url,
          metadata: metadata.join('\n')
        })
      })
    });
    more = data('.nav-previous').attr('href');
  }).catch(err => {
    throw err;
  }).finally(() => {
    return more;
  });
}

function getFromDb() {
  Episode.findAll().then(episodes => {
    console.log(episodes);
  });
}

module.exports = {
  get: get,
  getFromDb: getFromDb
};
