const { MongoClient } = require('mongodb');
const http = require('http');
const url = require('url');
const fs = require('fs');

// Connection URI
const uri = 'mongodb+srv://fuqinghao:fuqinghao@cluster0.xz0xowj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

// Database Name
const dbName = 'Stock';
const collectionName = 'PublicCompanies';

// Create HTTP server
http.createServer(function (req, res) {
    const urlObj = url.parse(req.url, true);
    const path = urlObj.pathname;

    if (path === '/') {
        const file = "webappform.html";
        fs.readFile(file, function(err, home) {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write('Internal Server Error');
                res.end();
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(home);
            res.end();
        });
    } else if (path === '/process') {
        processSearch(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found');
        res.end();
    }
}).listen(process.env.PORT);

async function processSearch(req, res) {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Get query parameters from request URL
        const query = url.parse(req.url, true).query;
        const searchInput = query.searchInput;
        const searchType = query.searchType;

        // Determine search type
        let queryObject = {};
        if (searchType === 'ticker') {
            queryObject = { "ticker_symbol": searchInput };
            // console.log("This is TICKER searchinput: "+ searchInput);
        }
        if (searchType === 'company') {
            queryObject = { "company_name": searchInput };
            // console.log("This is COMPANY searchinput: "+ searchInput);
        }
        //ABOVE ARE GOOD

        // Query the database
        const results = await collection.find(queryObject).toArray(); 

        // Display the data in the console
        console.log('Search results:');
        results.forEach(result => {
            console.log('Company:', result.company_name);
            console.log('Ticker Symbol:', result.ticker_symbol);
            console.log('Stock Price:', result.stock_price);
        });

        // Send response with search results
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<h1>Search Results</h1>');
        results.forEach(result => {
            res.write(`<p>Company: ${result.company_name}, Ticker Symbol: ${result.ticker_symbol}, Stock Price: ${result.stock_price}</p>`);
        });
        res.end();

    } catch (err) {
        console.error('Error:', err);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('Internal Server Error');
        res.end();
    } finally {
        // Close connection
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}
