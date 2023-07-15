const pg = require('pg');
const copyFrom = require('pg-copy-streams').from;
const { Client } = pg;
const fs = require('fs');
const path = require('path');

const prodInfo = { path: path.resolve(__dirname, '../assets/product.csv'), columns: 'id, name, slogan, description, category, default_price' };
const stylesInfo = { path: path.resolve(__dirname, '../assets/styles.csv'), columns: 'id, productId, name, sale_price, original_price, default_style' };
const skusInfo = { path: path.resolve(__dirname, '../assets/skus.csv'), columns: 'id, styleId, size, quantity' };
const relatedInfo = { path: path.resolve(__dirname, '../assets/related.csv'), columns: 'id, current_product_id, related_product_id' };
const photosInfo = { path: path.resolve(__dirname, '../assets/photos.csv'), columns: 'id, styleId, url, thumbnail_url' }
const featuresInfo = { path: path.resolve(__dirname, '../assets/features.csv'), columns: 'id, product_id, feature, value' }


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
    await postgresConnection.connect();

    const dropDatabaseQuery = 'DROP DATABASE IF EXISTS product_data';
    const createDatabaseQuery = 'CREATE DATABASE product_data';

    await postgresConnection.query(dropDatabaseQuery);
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

      CREATE TABLE IF NOT EXISTS features (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        feature VARCHAR(30),
        value VARCHAR(30)
      );

      CREATE INDEX IF NOT EXISTS features_product_id_index ON features(product_id);

      CREATE TABLE IF NOT EXISTS related (
        id SERIAL PRIMARY KEY,
        current_product_id INTEGER REFERENCES products(id),
        related_product_id INTEGER
      );

      CREATE INDEX IF NOT EXISTS related_current_id_index ON related(current_product_id);

      CREATE TABLE IF NOT EXISTS styles (
        id SERIAL PRIMARY KEY,
        productId INTEGER REFERENCES products(id),
        name VARCHAR(30),
        sale_price INTEGER NULL,
        original_price INTEGER,
        default_style BOOLEAN
      );

      CREATE INDEX IF NOT EXISTS styles_productId_index ON styles(productId);

      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        styleId INTEGER REFERENCES styles(id),
        url TEXT,
        thumbnail_url TEXT
      );

      CREATE INDEX IF NOT EXISTS photos_styleId_index ON photos(styleId);

      CREATE TABLE IF NOT EXISTS skus (
        id SERIAL PRIMARY KEY,
        styleId INTEGER REFERENCES styles(id),
        size VARCHAR(10),
        quantity INTEGER
      );

      CREATE INDEX IF NOT EXISTS skus_styleId_index ON skus(styleId);

    `;

    await connection.query(createTableQuery);


    const copyTableData = async (table, filePath, columns) => {
      try {

        const copyQuery = `COPY ${table}(${columns}) FROM '${filePath}' DELIMITER ',' CSV HEADER NULL 'null'`;
        await connection.query(copyQuery);

        console.log(`Data copied successfully for table '${table}'`);
      } catch (error) {
        console.error(`Error copying data for table '${table}':`, error);
      }
    };

    async function copyData() {
      try {
        const tables = [
          { name: 'products', filePath: prodInfo.path, columns: prodInfo.columns },
          { name: 'styles', filePath: stylesInfo.path, columns: stylesInfo.columns },
          { name: 'skus', filePath: skusInfo.path, columns: skusInfo.columns },
          { name: 'related', filePath: relatedInfo.path, columns: relatedInfo.columns },
          { name: 'photos', filePath: photosInfo.path, columns: photosInfo.columns },
          { name: 'features', filePath: featuresInfo.path, columns: featuresInfo.columns }
        ];

        for (const { name, filePath, columns } of tables) {
          await copyTableData(name, filePath, columns);
        }

        console.log('Data copied successfully!');
      } catch (err) {
        console.error('Error copying data:', err);
      }
    }

    await copyData();

    //Analyze after load to speed up queries
    await connection.query('ANALYZE')

    console.log('Database created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await connection.end();
  }
}

module.exports = { connection, createDatabase }
