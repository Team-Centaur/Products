const express = require('express');
const app = express();
const db = require('./PrimaryDB.js');
const routes = require('./routes.js');
const pg = require('pg');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(routes);

async function startServer() {

try {

await db.createDatabase();

} catch (err) {
  console.log(err)

} finally {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
}

startServer();