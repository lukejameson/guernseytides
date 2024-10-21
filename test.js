const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeWebsite(url) {
  try {
    // Make a GET request to the website
    const response = await axios.get(url);

    // Parse the HTML content
    const $ = cheerio.load(response.data);

    // Extract data (this is just an example - adjust selectors as needed)
    const title = $('title').text();
    const paragraphs = $('p').map((i, el) => $(el).text()).get();

    // Process the data
    console.log('Title:', title);
    console.log('Paragraphs:', paragraphs);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
scrapeWebsite('https://tides.digimap.gg/');
