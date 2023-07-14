const express = require('express');
const { Client } = require('pg');
const db = require('./PrimaryDB.js')
const app = express();
const port = 3000;

app.use(express.json());



async function startServer() {

try {
await db.createDatabase();
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

} catch (err) {
  console.log(err)
}

}

startServer();