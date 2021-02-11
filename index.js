const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const routes = require('./routes');
require('dotenv').config();
require('./config/cloudinary');
require('./config/passport');

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

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
