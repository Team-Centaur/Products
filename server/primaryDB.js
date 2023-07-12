const { Client } = require('pg');
const pgp = require('pg-promise')

const connection = new Client({
  user: postgres,
  host: '',
  database: '',
  password: '',
  port: '',
});


const asyncConnection = pgp(connection);


async function createTable() {

  try {
    await client.connect();

    const createDatabaseQuery = 'CREATE DATABASE product-data';
    await client.query(createDatabaseQuery);

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(25),
        slogan TEXT,
        description TEXT,
        category VARCHAR(25),
        default price INT,
      );

      CREATE TABLE IF NOT EXISTS related (
        id SERIAL PRIMARY KEY,
        current_product_id INTEGER,
        related_product_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS styles (
        id SERIAL PRIMARY KEY,
        productId INTEGER REFERENCES product(id),
        name VARCHAR(30),
        sale_price INTEGER,
        original_price INTEGER,
        default_style BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS skus (
        id SERIAL,
        styleId INTEGER REFERENCES styles(id),
        size VARCHAR(5)
        quantity INTEGER
      );
      `;


    await client.query(createTableQuery);

    console.log('Table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await client.end();
  }
}

createTable();
