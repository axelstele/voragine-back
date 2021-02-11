const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const pool = require('../config/database');

const streamUpload = (file) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    },
  );

  streamifier.createReadStream(file.buffer).pipe(stream);
});

const create = async (request, response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      body: {
        title, description, price, category, quantity,
      },
      files,
    } = request;
    client.query(`
      INSERT INTO "${process.env.DATABASE_SCHEMA}"."products" (title, description, price, category_id, quantity)
      VALUES ($1, $2, $3, $4, $5)`, [title, description, price, category, quantity], (error) => {
      if (error) {
        throw error;
      }
      client.query(`SELECT MAX(id) as lastid FROM "${process.env.DATABASE_SCHEMA}"."products"`, (error2, results) => {
        if (error2) {
          throw error2;
        }
        const { lastid } = results.rows[0];
        files.map(async (file) => {
          const { url } = await streamUpload(file);
          client.query(`INSERT INTO "${process.env.DATABASE_SCHEMA}"."images_products" (product_id, url)
          VALUES ($1, $2)`, [lastid, url], (error3) => {
            if (error3) {
              throw error3;
            }
          });
        });
        return response.sendStatus(201);
      });
    });
    client.query('COMMIT');
  } catch (error) {
    client.query('ROLLBACK');
    response.sendStatus(500);
  }
};

const get = async (request, response) => {
  try {
    const client = await pool.connect();
    client.query(`
      SELECT p.id, p.title, p.description, p.price, p.quantity, ARRAY_REMOVE(ARRAY_AGG(ip.url), NULL) AS images
      FROM "${process.env.DATABASE_SCHEMA}"."products" p 
      LEFT JOIN "${process.env.DATABASE_SCHEMA}"."images_products" ip ON p.id = ip.product_id
      GROUP BY p.id`, (error, results) => {
      if (error) {
        throw error;
      }
      return response.status(200).send(results.rows);
    });
  } catch (error) {
    response.sendStatus(500);
  }
};

module.exports = {
  create,
  get,
};
