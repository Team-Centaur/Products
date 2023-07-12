import mongoose from 'mongoose'
const { Schema } = mongoose;

async function createTable() {
  try {
    await mongoose.connect('mongodb://localhost:27017/product-data', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const productSchema = new mongoose.Schema({
      id: { type: Number, required: true },
      name: { type: String, required: true },
      slogan: String,
      description: String,
      category: String,
      default_price: Number,
    });

    const Product = mongoose.model('Product', productSchema);

    const relatedSchema = new mongoose.Schema({
      id: { type: Number, required: true },
      current_product_id: Number,
      related_product_id: Number
    });

    const Related = mongoose.model('Related', relatedSchema);

    const stylesSchema = new mongoose.Schema({
      id: { type: Number, required: true },
      productId: { type: Number, ref: 'Product'},
      sale_price: Number,
      original_price: Number,
      default_style: Boolean
    });

    const Style = mongoose.model('Style', stylesSchema);

    const skusSchema = new mongoose.Schema({
      id: { type: Number, required: true },
      styleId: { type: Number, ref: 'Style' },
      size: String,
      quantity: Number,
    });

    const Sku = mongoose.model('Sku', skusSchema);

    console.log('Collection created successfully!');
  } catch (error) {
    console.error('Error creating collection:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTable();