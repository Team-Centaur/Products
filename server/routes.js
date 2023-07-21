const express = require('express');
const route = express.Router();
const model = require('./models.js')
const memjs = require('memjs');
const memeCachedClient = memjs.Client.create();

route.get('/products', async (req, res) => {
  const page = req.query.page || 1
  const cacheKey = `products:${page}`;

  memeCachedClient.get(cacheKey, async (err, value) => {
    if (err) {
      console.error('Error retrieving data from cache:', err);
      res.status(500).send('Error retrieving data from cache');
      return;
    }

    if (value) {
      const cachedData = JSON.parse(value.toString());
      res.json(cachedData);
    } else {
  try {
  const products = await model.fetchProducts(page, req.query.count);
  await console.log(req.query);
  res.send(products);
  } catch (error) {
    console.log('hello')
    res.status(500).send(error);
  }
}
});
});

route.get('/products/:id', async (req, res) => {
  try {
  const product = await model.fetchProduct(req.params.id);
  res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/products/:id/styles', async (req, res) => {
  try{
  const styles = await model.fetchProductStyles(req.params.id);
  res.status(200).send(styles);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/products/:id/related', async (req, res) => {
  try {
  const related = await model.fetchRelated(req.params.id);
  res.status(200).send(related);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/loaderio-5cef59c62337cd075c670b850432c9b4.txt', function(req, res){
  res.send('loaderio-5cef59c62337cd075c670b850432c9b4');
});

module.exports = route;