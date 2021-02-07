const bcrypt = require('bcrypt');
const { database } = require('../database');

const login = (request, response) => {
  const { body } = request;
  database.query(`SELECT * FROM "${process.env.LOCAL_DATABASE_SCHEMA}"."users" as u WHERE email = '${body.email}'`, (error, results) => {
    if (error) {
      throw error;
    }
    if (!results.rows.length) {
      return response.status(404).send({
        message: 'User not found.',
      });
    }
    const user = results.rows[0];
    bcrypt.compare(body.password, user.password, (err, res) => {
      if (err) {
        return response.status(500).send({ message: 'An error occurred. Try again later.' });
      }
      if (res) {
        return response.status(200).send({ message: 'Logged in.' });
      }
      return response.status(401).send({ message: 'User or password incorrect.' });
    });
  });
};

module.exports = {
  login,
};
