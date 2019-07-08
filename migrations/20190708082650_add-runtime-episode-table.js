
exports.up = knex => knex.schema.table('episode', table => {
  table.integer('runtime')
})

exports.down = knex => knex.schema.table('episode', table => {
  table.dropColumn('runtime')
})
