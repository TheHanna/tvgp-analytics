
exports.up = knex => knex.schema.table('episode', table => {
  table.integer('fileSize')
  table.string('fileType')
  table.string('fileUrl')
})

exports.down = knex => knex.schema.table('episode', table => {
  table.dropColumn('fileSize')
  table.dropColumn('fileType')
  table.dropColumn('fileUrl')
})
