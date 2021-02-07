const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const users = require('./queries/users');

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

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.post('/login', (request, response) => users.login(request, response));

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
