const { database } = require('../database');

const get = (request, response) => {
  database.query('SELECT * FROM "voragine"."users" ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

module.exports = {
  get,
};
