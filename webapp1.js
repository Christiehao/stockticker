const fs = require('fs');
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb+srv://fuqinghao:fuqinghao@cluster0.xz0xowj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

// Database Name
const dbName = 'Stock';
const collectionName = 'PublicCompanies';

async function insertData() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Read the CSV file line by line
        const csvFile = 'companies.csv';
        const data = fs.readFileSync(csvFile, 'utf8');

        // Split the file content by lines
        const lines = data.split('\n');

        // Process each line of the CSV file starting from the second row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            // Check if the line is empty to stop reading
            if (line.trim() === '') {
                console.log('Omitting the last blank row.');
                break;
            }

            // Split the line by comma to get company, ticker, and price
            const [company_name, ticker_symbol, stock_price] = line.trim().split(',');

            // Insert data into MongoDB
            const result = await collection.insertOne({ company_name, ticker_symbol, stock_price });
            console.log('Insert result:', result);
        }

        console.log('All documents inserted successfully.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Close the MongoDB connection
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

// Call the insertData function
insertData();
