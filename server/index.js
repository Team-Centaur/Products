const express = require('express');
const app = express();
const db = require('./PrimaryDB.js');
const routes = require('./routes.js');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/products', routes);

async function startServer() {

try {
await db.createDatabase();
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

} catch (err) {
  console.log(err)

} finally {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
}

startServer();