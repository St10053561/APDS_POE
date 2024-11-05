import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const uri = process.env.ATLAS_URL; // Use the connection string from the .env file
const client = new MongoClient(uri);

const password = "Abc@1234"; // Your specified plaintext password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
    } else {
        console.log("Hashed password:", hash);
        const employeeRecord = {
            username: "emp1", // Your specified username
            password: hash,
            firstName: "John",
            lastName: "Doe",
            role: "Manager"
        };

        try {
            await client.connect();
            const database = client.db('APDS'); 
            const collectionName = 'Employees'; // Collection name

            // Check if the collection exists
            const collections = await database.listCollections({ name: collectionName }).toArray();
            if (collections.length === 0) {
                // Create the collection if it doesn't exist
                await database.createCollection(collectionName);
                console.log(`Collection '${collectionName}' created.`);
            } else {
                console.log(`Collection '${collectionName}' already exists.`);
            }

            // Insert the employee record
            const collection = database.collection(collectionName); 
            const result = await collection.insertOne(employeeRecord);
            console.log(`New employee created with the following id: ${result.insertedId}`);
        } catch (error) {
            console.error("Error inserting employee record:", error);
        } finally {
            await client.close();
        }
    }
});