const pg = require('pg');
const copyFrom = require('pg-copy-streams').from;
const { Client } = pg;
const fs = require('fs');
const path = require('path');

const connection = new Client({
  user: 'aaronbrandenberger',
  host: '3.17.69.225',
  database: 'product_data',
  password: 'password',
  port: 5432,
});

async function connect() {
  try {
    await connection.connect();
    console.log("Connected to the database");
  } catch (err) {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  }
}
connect();

const cacheProducts = async (lastID, count) => {
  count = count || 5;
  lastID = lastID || 0;
  try {
    const res = await connection.query(`
    SELECT products.id, name, slogan, description, category, default_price FROM products
    WHERE id > $1
    ORDER BY id
    LIMIT $2;`, [lastID, count]);

    const data = res.rows.map((row) => (
      {
        "id": row['id'],
        "name": row['name'],
        "slogan": row['slogan'],
        "description": row['description'],
        "category": row["category"],
        "default_price": row["default_price"]
      }
    ))
    return data;

  } catch(err) {
    throw err;
  }
};

const fetchProducts = async (page, count) => {
  page = page || 1;
  count = count || 5;
  try {
    const res = await connection.query(`
    SELECT products.id, name, slogan, description, category, default_price FROM products
    LIMIT $2
    OFFSET ($1 - 1) * $2;`, [page, count]);

    const data = res.rows.map((row) => (
      {
        "id": row['id'],
        "name": row['name'],
        "slogan": row['slogan'],
        "description": row['description'],
        "category": row["category"],
        "default_price": row["default_price"]
      }
    ))
    return data;

  } catch(err) {
    throw err;
  }
};

const fetchProduct = async (id) => {
  try {
    const res = await connection.query(`
    SELECT products.id, name, slogan, description, category, default_price,
    COALESCE(array_agg(COALESCE(features.feature, '')), ARRAY[]::text[]) AS features,
    COALESCE(array_agg(COALESCE(features.value, '')), ARRAY[]::text[]) AS values
      FROM products JOIN features ON product_id = products.id AND products.id = $1
      GROUP BY products.id;
      `, [id]);

    if (res.rows.length > 0) {
      return res.rows.map((row) => ({
          "id": id,
          "name": row['name'],
          "slogan": row['slogan'],
          "description": row['description'],
          "category": row['category'],
          "default_price": row['default_price'],
          "features": row['features'].map((feature, i) => ({
            "feature": feature,
            "value": row['values'][i]
          })),
      }));
    } else {
      throw new Error(`No product found with id: ${id}`);
    }
  } catch(err) {
    throw err;
  }
};

const fetchProductStyles = async (id) => {
  try {
    const res = await connection.query(`
    WITH style_sku_query AS (
      SELECT styles.id, name, sale_price, original_price, default_style,
             array_agg(skus.id) AS sku_ids,
             array_agg(skus.size) AS sizes,
             array_agg(skus.quantity) AS quantities
      FROM styles
      JOIN skus ON styleId = styles.id AND productId = $1
      GROUP BY styles.id, name, sale_price, original_price, default_style
    )
        SELECT style_sku_query.id, style_sku_query.name, style_sku_query.sale_price, style_sku_query.original_price, style_sku_query.default_style, style_sku_query.sku_ids, style_sku_query.sizes, style_sku_query.quantities,
              COALESCE(array_agg(COALESCE(photos.url)), ARRAY[]::text[]) AS url,
              COALESCE(array_agg(COALESCE(photos.thumbnail_url)), ARRAY[]::text[]) AS thumbnail_url
        FROM style_sku_query
        LEFT JOIN photos ON style_sku_query.id = photos.styleId
        GROUP BY style_sku_query.id, style_sku_query.name, style_sku_query.sale_price, style_sku_query.original_price, style_sku_query.default_style, style_sku_query.sku_ids, style_sku_query.sizes, style_sku_query.quantities;`,
        [id]);

    const data = {
      "product_id": id,
      "results": res.rows.map((row) => ({
        "style_id": row.id,
        "name": row.name,
        "original_price": row.original_price,
        "sale_price": row.sale_price,
        "default?": row.default_style,
        "photos": row['url'].map((url, i) => ({
          "thumbnail_url": row['thumbnail_url'][i],
          "url": url,
        })),
        "skus": row['sku_ids'].reduce((acc, sku, i) => ({
          ...acc,
          [sku]: {
            size: row['sizes'][i],
            quantity: row['quantities'][i]
          }
        }), {})
      }))
    };

    return data;
  } catch(err) {
    throw err;
  }
};

const fetchRelated = async (id) => {
  try {
    const res = await connection.query(`SELECT related_product_id FROM related WHERE current_product_id = $1;`, [id]);
    const data = res.rows.map((row) => row['related_product_id']);

    return data;
  } catch (err) {
    throw err;
  }
}


module.exports = { fetchProduct, fetchProducts, fetchRelated, fetchProductStyles, cacheProduct }


