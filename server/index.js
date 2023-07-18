const express = require('express');
const app = express();
const db = require('./PrimaryDB.js');
const routes = require('./routes.js');
const pg = require('pg');
const port = 3000;
const { Client } = require('pg')

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(routes);

async function startServer() {

try {

  const connection = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'product_data',
    password: '',
    port: 5432,
  });

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