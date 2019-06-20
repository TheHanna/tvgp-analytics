
exports.up = knex => knex.schema.createTable('episode', table => {
  table.increments('id')
  table.integer('number')
  table.string('title')
  table.text('html')
  table.text('description')
  table.datetime('publishDate')
  table.string('guid')
  table.timestamps()
})

exports.down = knex => knex.schema.dropTable('episode')
