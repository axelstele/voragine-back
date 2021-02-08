const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
require('./cloudinary-config');

const users = require('./queries/users');
const products = require('./queries/products');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.options('*', cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(bodyParser.json());

const fileUpload = multer();

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

// users
app.post('/login', (request, response) => users.login(request, response));

// products
app.post('/products', fileUpload.array('images'), (request, response) => products.create(request, response));

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
