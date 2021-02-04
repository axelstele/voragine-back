const { Pool } = require('pg');

const env = process.env.NODE_ENV || 'development';

let connectionString;

if (env === 'development') {
  connectionString = {
    user: process.env.LOCAL_DATABASE_USER,
    host: process.env.LOCAL_DATABASE_HOST,
    database: process.env.LOCAL_DATABASE_NAME,
    password: process.env.LOCAL_DATABASE_PASSWORD,
    port: process.env.LOCAL_DATABASE_PORT,
  };
} else {
  connectionString = {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  };
}

console.log(connectionString);

const database = new Pool(connectionString);
database.on('connect', () => console.log('connected to db'));

module.exports = {
  database,
};
