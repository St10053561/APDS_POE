import { MongoClient, ServerApiVersion } from "mongodb"; // Import MongoClient from the mongodb package
import dotenv from "dotenv"; // Import dotenv to load environment variables

dotenv.config(); // Load environment variables from a .env file

const connectionString = process.env.ATLAS_URL || ""; // Get the MongoDB connection string from environment variables

console.log(connectionString); // Log the connection string (for debugging purposes)

const client = new MongoClient(connectionString, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}); // Create a new MongoClient instance

async function connectDB() {
    try {
        await client.connect(); // Attempt to connect to the MongoDB server
        await client.db("admin").command({ ping: 1 }); // Ping the MongoDB server to check if it's connected
        console.log('mongoDB is CONNECTED!!! :)'); // Log a success message if connected
    } catch (err) {
        console.log(err); // Log the error if the connection fails
    }
}

connectDB(); // Call the async function to connect to the database

let db = client.db("APDS"); // Select the "APDS" database

export { db, client }; // Export both the db object and the client instance