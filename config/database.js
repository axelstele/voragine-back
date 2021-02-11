const { Pool } = require('pg');
const { DEVELOPMENT } = require('../utils/constants/global');

const env = process.env.NODE_ENV || DEVELOPMENT;

let connectionString;

if (env === DEVELOPMENT) {
  connectionString = {
    database: process.env.LOCAL_DATABASE_NAME,
    host: process.env.LOCAL_DATABASE_HOST,
    password: process.env.LOCAL_DATABASE_PASSWORD,
    port: process.env.LOCAL_DATABASE_PORT,
    user: process.env.LOCAL_DATABASE_USER,
  };
} else {
  connectionString = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
}

const pool = new Pool(connectionString);

module.exports = pool;
