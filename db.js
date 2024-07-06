const { MongoClient } = require('mongodb');
require('dotenv').config(); // Ensure environment variables are loaded

const uri = process.env.MONGO_URI;

let db;

async function connectToDatabase() {
    console.log('connectToDatabase called'); // Log function call
    if (db) return db; // Return existing connection if already connected
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(); // Default database is used if not explicitly specified in the URI
        return db;
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
}

module.exports = connectToDatabase;
