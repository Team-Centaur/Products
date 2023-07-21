const express = require('express');
const app = express();
const routes = require('./routes.js');
const pg = require('pg');
const port = 3000;
const { Client } = require('pg');
const query = require('./models.js');
const memjs = require('memjs');
const memeCachedClient = memjs.Client.create();

const connection = new Client({
  user: 'aaronbrandenberger',
  host: '3.17.69.225',
  database: 'product_data',
  password: 'password',
  port: 5432,
});

// (async () => {
//   let lastID = 0;
//   let pageNumber = 1;
//   while (true) {
//   try {
//     const response = await query.cacheProducts(lastID, 5);
//     if (response.length === 0) {
//       break;
//     }
//     await memeCachedClient.set(`products:${pageNumber}`, JSON.stringify(response));
//     console.log(`Cached Page: ${pageNumber}`)
//     pageNumber++
//     lastID = response[response.length - 1].id;
//   } catch (error) {
//     console.error(`Failed on page ${pageNumber}: ${error}`);
//     }
//   }
//   memeCachedClient.close();
//   console.log('Caching Complete');
// })();


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