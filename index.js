const express = require('express');
const bodyParser = require('body-parser');
const users = require('./queries/users');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/users', users.get);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
