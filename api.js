const models = require('./models')

models.host.findAll({
  include: ['episodes']
}).then(hosts => {
  hosts.forEach(host => console.log(host.fullName, host.episodes.length))
})