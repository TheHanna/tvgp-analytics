// Update with your config settings.
require('dotenv').config({ path: './config/.env' })

let min, max, pool; [min, max, pool] = [process.env.DB_POOL_MIN || 2, process.env.DB_POOL_MAX || 10, { min, max }]
const migrations = { tableName: process.env.DB_MIGRATIONS_TABLE_NAME || 'knex_migrations' }
const client = process.env.DB_CLIENT || 'mysql'
const connection = process.env.CLEARDB_DATABASE_URL || {
  socketPath: process.env.DB_SOCKET_PATH,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
}

module.exports = {
  development: { client, connection, migrations },
  production: { client, connection, pool, migrations }
};
