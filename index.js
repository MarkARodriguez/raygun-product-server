const express = require('express');
const fs = require('fs');
const app = express();
const queryNotionDatabase = require('./notionQuery');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = process.env.YOUR_DOMAIN;


// Now you can access the IDs in your code
const cors = require('cors');
app.use(cors()); 

//grabbing the product data and writing a file

async function executeQuery(databaseId, brandId) {
  try {
    const data = await queryNotionDatabase(databaseId);
    // Save the data to a file named after the brand's id
    fs.writeFile(`${brandId}Data.json`, JSON.stringify(data, null, 2), (err) => {
      if (err) console.error('Error writing to file:', err);
    });
  } catch (error) {
    console.error('Error fetching data from Notion:', error);
  }
}


function processBrands(brands) {
  brands.forEach(brand => {
    // Execute the query for each brand using both databaseId and brand id
    executeQuery(brand.databaseId, brand.id);
  });
}

// Read the brand data file and process each brand
fs.readFile('brandData.json', 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file from disk: ${err}`);
    return;
  }

  const brands = JSON.parse(data);
  console.log(`Successfully read file. Processing brands...`);
  processBrands(brands);
});


const port = 3001;

//endpoint for brands
app.get('/brands', (req, res) => {
  fs.readFile('brandData.json', 'utf8', (err, data) => {
    // console.log(data);
    if (err) {
      console.error(`Error reading file from disk: ${err}`);
      res.status(500).send('Error reading data');
    } else {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    }
  });
});

//what i am working on now
// Function to setup routes
function sendBrandProducts(brands) {
  brands.forEach(brand => {
    app.get(`/brands/${brand.id}`, (req, res) => {
      console.log(`User requesting the following brand information: ${brand.id}`);
      
      // Read the associated brand data file using brand id
      fs.readFile(`${brand.id}Data.json`, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file from disk: ${err}`);
          res.status(500).send('Server Error');
          return;
        }

        const brandData = JSON.parse(data);
        res.json(brandData);
      });
    });
  });
}

// Read the brand data file
fs.readFile('brandData.json', 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file from disk: ${err}`);
    return;
  }

  // Parse the data into a JavaScript object
  const brands = JSON.parse(data);
  console.log(`Successfully read file. Brands: ${JSON.stringify(brands)}`);

  // Setup routes after file read operation has completed
  sendBrandProducts(brands);
});


//endpoint for categories
app.get('/categories', (req, res) => {
  fs.readFile('productCategories.json', 'utf8', (err, data) => {
    // console.log(data);
    if (err) {
      console.error(`Error reading file from disk: ${err}`);
      res.status(500).send('Error reading data');
    } else {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    }
  });
});

 //endpoint for limitedEdition
app.get('/limited', (req, res) => {
  fs.readFile('limitedEdition.json', 'utf8', (err, data) => {
    // console.log(data);
    if (err) {
      console.error(`Error reading file from disk: ${err}`);
      res.status(500).send('Error reading data');
    } else {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    }
  });
});

app.use(express.json());
//Payments endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
      const cartItems = req.body.cartItems;

      const line_items = cartItems.map(item => {
          const price = Number(item.Price);
          const quantity = Number(item.quantity);

          if (isNaN(price)) {
              throw new Error(`Invalid price: ${item.Price}`);
          }

          if (isNaN(quantity)) {
              throw new Error(`Invalid quantity: ${item.Quantity}`);
          }

          return {
              price_data: {
                  currency: 'usd',
                  product_data: {
                      name: item.Name,
                      images: item.Image ? [item.Image] : [],
                  },
                  unit_amount: Math.round(price * 100),
              },
              quantity: quantity,
          };
      });

      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${YOUR_DOMAIN}/checkout`,
      });

      res.json({ id: session.id });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

// Listening to the port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
