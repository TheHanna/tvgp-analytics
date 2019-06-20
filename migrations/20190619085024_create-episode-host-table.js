
exports.up = knex => knex.schema.createTable('episode_host', table => {
  table.increments('id')
  table.integer('hostId').unsigned()
  table.integer('episodeId').unsigned()
  table.timestamps()
  table.foreign('hostId').references('host.id')
  table.foreign('episodeId').references('episode.id')
})

exports.down = knex => knex.schema.dropTable('episode_host')
