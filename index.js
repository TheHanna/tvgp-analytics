const scraper = require('./scraper');
const db = require('./db');

function runScraper() {
  let next = scraper.get();
  console.log(next);
}

function getEpisodes() {
  scraper.getFromDb();
}

// runScraper();
getEpisodes();
