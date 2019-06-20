
exports.up = knex => knex.schema.createTable('host', table => {
  table.increments('id')
  table.string('firstName')
  table.string('lastName')
  table.string('displayName').nullable()
  table.timestamps()
})

exports.down = knex => knex.schema.dropTable('host')
