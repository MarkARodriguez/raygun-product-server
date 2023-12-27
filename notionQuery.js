const fs = require('fs');
const cors = require('cors');
const parser = require('body-parser');


const { Client } = require('@notionhq/client');

const notion = new Client({ auth: "secret_lPbvYbVn6eZSSuusYQ6Ocy15nKjlS96bYYTghldbKmP" }); //hide later

async function queryNotionDatabase() {
  try {
    const databaseId = 'b642fca066454c7188f10529ccf98896';
    const response = await notion.databases.query({ database_id: databaseId });

    return response.results.map(page => {
      let rowData = {};
      for (let [propertyName, propertyValue] of Object.entries(page.properties)) {
        switch (propertyValue.type) {
          case 'title':
            rowData[propertyName] = propertyValue.title[0]?.plain_text || "";
            break;
          case 'rich_text':
            rowData[propertyName] = propertyValue.rich_text[0]?.plain_text || "";
            break;
          case 'number':
            rowData[propertyName] = propertyValue.number || 0;
            break;
          case 'select':
            rowData[propertyName] = propertyValue.select?.name || "";
            break;
          case 'multi_select':
            rowData[propertyName] = propertyValue.multi_select.map(select => select.name);
            break;
          case 'date':
            rowData[propertyName] = propertyValue.date?.start || "";
            break;
            case 'url': // Assuming Image URLs are stored as URL or Rich Text
            rowData[propertyName] = propertyValue.rich_text[0]?.plain_text || propertyValue.url || "";
            break;
          default:
            console.log(`Unhandled property type: ${propertyValue.type}`);
        }
      }
      return rowData;
    });
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to handle it in index.js
  }
}

module.exports = queryNotionDatabase;
