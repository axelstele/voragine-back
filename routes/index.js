const express = require('express');
const multer = require('multer');
const passport = require('passport');
const users = require('../queries/users');
const products = require('../queries/products');

const router = express.Router();
const fileUpload = multer();

router.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

// users
router.post('/login', (req, res) => users.logIn(req, res));
router.post('/logout', (req, res) => users.logOut(req, res));
router.post('/token', (req, res) => users.token(req, res));

// products
router.post('/products', passport.authenticate('jwt'), fileUpload.array('images'), (request, response) => products.create(request, response));
router.get('/products', passport.authenticate('jwt'), (request, response) => products.get(request, response));

module.exports = router;
