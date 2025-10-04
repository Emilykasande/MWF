const mongoose = require('mongoose');
const Product = require('./models/productsModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mayondo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleProducts = [
  {
    name: 'Sofa Set',
    price: 150000,
    img: '/Images/sofa set.jpeg'
  },
  {
    name: 'Bed Room Set',
    price: 200000,
    img: '/Images/bed room.jpeg'
  },
  {
    name: 'Dining Table Set',
    price: 85000,
    img: '/Images/dinning.jpeg'
  },
  {
    name: 'Office Chair',
    price: 45000,
    img: '/Images/no-image.png'
  },
  {
    name: 'Coffee Table',
    price: 35000,
    img: '/Images/no-image.png'
  },
  {
    name: 'Bookshelf',
    price: 55000,
    img: '/Images/no-image.png'
  }
];

async function addSampleProducts() {
  try {
    console.log('Adding sample products to database...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Added ${products.length} sample products`);

    console.log('Sample products:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - UGX ${product.price}`);
    });

    console.log('\nYou can now visit http://localhost:3000/ecommerce to see the products!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample products:', error);
    process.exit(1);
  }
}

addSampleProducts();
