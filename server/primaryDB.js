const { Client } = require('pg');
const copyFrom = require('pg-copy-streams').from;
const fs = require('fs');
const path = require('path');
const prodPath = path.resolve(__dirname, '../assets/product.csv');

const postgresConnection = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '',
  port: 5432,
});


const connection = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'product_data',
  password: '',
  port: 5432,
});

async function createDatabase() {

  try {

    await postgresConnection.connect()
    const dropDatabaseQuery = 'DROP DATABASE IF EXISTS product_data';
    await postgresConnection.query(dropDatabaseQuery);
    const createDatabaseQuery = 'CREATE DATABASE product_data';
    await postgresConnection.query(createDatabaseQuery);
    await postgresConnection.end();

    await connection.connect();

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(30),
        slogan TEXT,
        description TEXT,
        category VARCHAR(30),
        default_price INT
      );

      CREATE TABLE IF NOT EXISTS related (
        id SERIAL PRIMARY KEY,
        current_product_id INTEGER,
        related_product_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS styles (
        id SERIAL PRIMARY KEY,
        productId INTEGER REFERENCES products(id),
        name VARCHAR(30),
        sale_price INTEGER,
        original_price INTEGER,
        default_style BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS skus (
        id SERIAL PRIMARY KEY,
        styleId INTEGER REFERENCES styles(id),
        size VARCHAR(5),
        quantity INTEGER
      );
      `;
    await connection.query(createTableQuery);

    const productsStream = fs.createReadStream(prodPath);
    const copyProducts = connection.query(copyFrom('COPY products(id, name, slogan, description, category, default_price) FROM STDIN DELIMITER \',\' CSV HEADER'));

    await new Promise((resolve, reject) => {
      productsStream.pipe(copyProducts)
        .on('finish', resolve)
        .on('error', reject);
    });

    console.log('Table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await connection.end();
  }
}

module.exports = { connection, createDatabase }
