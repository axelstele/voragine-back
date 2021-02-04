const { Pool } = require('pg');

const database = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

module.exports = {
  database,
};
