const express = require('express');
const fs = require('fs');
const app = express();
const queryNotionDatabase = require('./notionQuery');
const cors = require('cors');
app.use(cors()); 

// Function to execute the query and handle the results
async function executeQuery() {
  try {
    const data = await queryNotionDatabase();
    // console.log(data);
    // Save the data to a file
    fs.writeFile('productData.json', JSON.stringify(data, null, 2), (err) => {
      if (err) console.error('Error writing to file:', err);
    });
  } catch (error) {
    console.error('Error fetching data from Notion:', error);
  }
}

// Run the query initially
executeQuery();


const port = 3001;
// Reading the product data from the json file
app.get('/products', (req, res) => {

  fs.readFile('productData.json', 'utf8', (err, data) => {
    console.log(data)
    if (err) {
      console.error(`Error reading file from disk: ${err}`);
      res.status(500).send('Error reading data');
    } else {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    }
  });
});

app.get('/brands', (req, res) => {
  fs.readFile('brandData.json', 'utf8', (err, data) => {
    console.log(data);
    if (err) {
      console.error(`Error reading file from disk: ${err}`);
      res.status(500).send('Error reading data');
    } else {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    }
  });
});

// Listening to the port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
