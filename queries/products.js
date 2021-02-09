const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { database } = require('../database');

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

const create = (request, response) => {
  try {
    const {
      body: {
        title, description, price, category, quantity,
      },
      files,
    } = request;
    database.query(`
      INSERT INTO "${process.env.DATABASE_SCHEMA}"."products" (title, description, price, category_id, quantity)
      VALUES ('${title}', '${description}', ${price}, ${category}, ${quantity})`, (error) => {
      if (error) {
        throw error;
      }
      database.query(`SELECT MAX(id) as lastid FROM "${process.env.DATABASE_SCHEMA}"."products"`, (error2, results) => {
        if (error2) {
          throw error2;
        }
        const { lastid } = results.rows[0];
        files.map(async (file) => {
          const { url } = await streamUpload(file);
          database.query(`INSERT INTO "${process.env.DATABASE_SCHEMA}"."images_products" (product_id, url)
          VALUES (${lastid}, '${url}')`, (error3) => {
            if (error3) {
              throw error3;
            }
          });
        });
        return response.status(201).send({
          message: 'Product added.',
        });
      });
    });
  } catch (error) {
    response.status(500).send({ message: 'An error occurred. Try again later.' });
  }
};

const get = (request, response) => {
  try {
    database.query(`
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
    response.status(500).send({ message: 'An error occurred. Try again later.' });
  }
};

module.exports = {
  create,
  get,
};
