const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const pool = require('../config/database');

const { DATABASE_SCHEMA, JWT_SECRET_PASSWORD } = process.env;

const logIn = async (request, response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { body: { email, password } } = request;
    client.query(`SELECT id, email, password FROM "${DATABASE_SCHEMA}"."users" WHERE email = $1`, [email], (err1, results) => {
      if (err1) {
        throw err1;
      }
      if (!results.rows.length) {
        return response.status(404).send({
          message: 'User not found.',
        });
      }
      const user = results.rows[0];
      return bcrypt.compare(password, user.password, (err2, res) => {
        if (err2) {
          return response.sendStatus(500);
        }
        if (res) {
          const token = jwt.sign({ email }, JWT_SECRET_PASSWORD, { expiresIn: 300 });
          const refreshToken = randtoken.uid(256);
          return client.query(`
          INSERT INTO "${DATABASE_SCHEMA}"."refresh_tokens" (email, token, refresh_token)
          VALUES ($1, $2, $3)`, [email, token, refreshToken], (err3) => {
            if (err3) {
              return response.sendStatus(500);
            }
            return response.status(200).send({ token, refreshToken });
          });
        }
        return response.status(401).send({ message: 'User or password incorrect.' });
      });
    });
    client.query('COMMIT');
  } catch (error) {
    client.query('ROLLBACK');
  }
};

const logOut = async (req, res) => {
  try {
    const { body: { refreshToken }, headers: { authorization } } = req;
    const token = authorization && authorization.replace('Bearer ', '');
    const { email } = jwt.decode(token);
    const client = await pool.connect();
    return client.query(`DELETE FROM "${DATABASE_SCHEMA}"."refresh_tokens" WHERE email = $1 AND token = $2 AND refresh_token = $3`, [email, token, refreshToken], (err) => {
      if (err) {
        throw err;
      }
      return res.sendStatus(200);
    });
  } catch ({ status }) {
    return res.sendStatus(200);
  }
};

const token = async (req, res) => {
  const { body: { refreshToken }, headers: { authorization } } = req;
  if (!authorization) {
    return res.sendStatus(401);
  }
  const oldToken = authorization && authorization.replace('Bearer ', '');
  const { email } = jwt.decode(oldToken);
  const client = await pool.connect();
  return client.query(`SELECT * FROM "${DATABASE_SCHEMA}"."refresh_tokens" WHERE email = $1 AND token = $2 AND refresh_token = $3`, [email, oldToken, refreshToken], (err, results) => {
    if (err) {
      throw err;
    }
    if (!results.rows.length) {
      return res.sendStatus(401);
    }
    const newToken = jwt.sign({ email }, JWT_SECRET_PASSWORD, { expiresIn: 300 });
    return client.query(`UPDATE "${DATABASE_SCHEMA}"."refresh_tokens" SET token = $3 WHERE email = $1 AND token = $2 AND refresh_token = $4`, [email, oldToken, newToken, refreshToken], (err2) => {
      if (err2) {
        throw err2;
      }
      return res.status(200).send({ token: newToken });
    });
  });
};

module.exports = {
  logIn,
  logOut,
  token,
};
