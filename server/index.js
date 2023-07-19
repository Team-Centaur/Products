const express = require('express');
const app = express();
const routes = require('./routes.js');
const pg = require('pg');
const port = 3000;
const { Client } = require('pg')

const connection = new Client({
  user: 'aaronbrandenberger',
  host: '3.134.77.55',
  database: 'product_data',
  password: 'password',
  port: 5432,
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(routes);

async function startServer() {

try {

  await connection.connect();

} catch (err) {
  console.log(err)

} finally {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
}

startServer();

module.exports = { connection }