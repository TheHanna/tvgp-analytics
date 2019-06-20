// Update with your config settings.
require('dotenv').config({ path: './config/.env' })

const pool = {
  min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE, 10) || 1000
}
const migrations = { tableName: process.env.DB_MIGRATIONS_TABLE_NAME || 'knex_migrations' }
const client = process.env.DB_CLIENT || 'mysql2'
const connection = process.env.CLEARDB_DATABASE_URL || {
  socketPath: process.env.DB_SOCKET_PATH,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
}

module.exports = {
  development: { client, connection, pool,  migrations },
  production: { client, connection, pool, migrations }
};
