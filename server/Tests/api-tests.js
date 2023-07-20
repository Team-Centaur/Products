import http from 'k6/http';
import { sleep, check } from 'k6';

function getRandomProductId(min, max) {
  return Math.floor(Math.random() * (max - min + 1));
}

export const options = {
  thresholds: {
    http_req_duration: ['avg < 400'],
    http_req_failed: ['rate<0.02'],
},

  scenarios: {
    my_scenario1: {
      executor: 'constant-arrival-rate',
      duration: '30s',
      preAllocatedVUs: 1000,
      rate: 200,
      timeUnit: '1s',
    },
  },
};

export default () => {

const productId = getRandomProductId(900000, 1000000);

const getProducts = http.get('http://3.134.102.46/products');
  check(getProducts, {
    'status was 200': (r) => r.status == 200,
    'response time is less than 700ms': (r) => r.timings.duration < 700,
  });

const getProduct = http.get(`http://3.134.102.46/products/${productId}`);
  const resultProd = check(getProduct, {
    'status was 200': (r) => r.status == 200,
    'response time is less than 700ms': (r) => r.timings.duration < 700,
  });

const getProductStyles = http.get(`http://3.134.102.46/products/${productId}/styles`)
  const resultStyle = check(getProductStyles, {
    'status was 200': (r) => r.status == 200,
    'response time is less than 700ms': (r) => r.timings.duration < 700,
  });

const getRelatedProducts = http.get(`http://3.134.102.46/products/${productId}/related`)
  const resultRelated = check(getRelatedProducts, {
    'status was 200': (r) => r.status == 200,
    'response time is less than 700ms': (r) => r.timings.duration < 700,
  });

  if (!resultProd) {
    console.log(`Check failed for individual product ${productId}`);
  }

  if (!resultStyle) {
    console.log(`Check failed for product styles ${productId}`);
  }

  if (!resultRelated) {
    console.log(`Check failed for related products ${productId}`);
  }


sleep(1);

};



