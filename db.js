const { MongoClient, ServerApiVersion } = require('mongodb');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGO_URI;

let db;

async function connectToDatabase() {
    console.log('connectToDatabase called'); // Log function call
    console.log(process.env.MONGO_URI)
    if (db) return db; // Return existing connection if already connected
    try {
        const client = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            }
        );

        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(); // Default database is used if not explicitly specified in the URI
        return db;
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
}

module.exports = connectToDatabase