const express = require('express');
const route = express.Router();
const model = require('./models.js')

route.get('/products', async (req, res) => {
  try {
  const products = await model.fetchProducts(req.query.page, req.query.count);
  res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/products/:id', async (req, res) => {
  try {
  const product = await model.fetchProduct(req.params.id);
  res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/products/:id/styles', async (req, res) => {
  try{
  const styles = await model.fetchProductStyles(req.params.id);
  res.send(styles);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/products/:id/related', async (req, res) => {
  try {
  const related = await model.fetchRelated(req.params.id);
  res.send(related);
  } catch (error) {
    res.status(500).send(error);
  }
});

