import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
const uri = process.env.ATLAS_URL; // Use the connection string from the .env file
const client = new MongoClient(uri);

// Use an environment variable for the password
const password = process.env.EMPLOYEE_PASSWORD; // Your specified plaintext password from .env
const saltRounds = 10;

async function createEmployee() {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log("Hashed password:", hash);

        const employeeRecord = {
            username: "emp1", // Your specified username
            password: hash,
            firstName: "John",
            lastName: "Doe",
            role: "Manager"
        };

        await client.connect();
        const database = client.db('APDS');
        const collectionName = 'Employees'; // Collection name

        const initialCount = await database.collection(collectionName).countDocuments();
        console.log(`Initial employee count: ${initialCount}`);

        // Check if the employee already exists
        const existingEmployee = await database.collection(collectionName).findOne({ username: employeeRecord.username });
        if (existingEmployee) {
            console.log(`Employee with username '${employeeRecord.username}' already exists.`);
            return; // Exit the function if the employee already exists
        }

        // Insert the employee record
        const result = await database.collection(collectionName).insertOne(employeeRecord);
        console.log(`New employee created with the following id: ${result.insertedId}`);

        const finalCount = await database.collection(collectionName).countDocuments();
        console.log(`Final employee count: ${finalCount}`);
    } catch (error) {
        console.error("Error during employee creation:", error);
    } finally {
        await client.close();
    }
}

// Call the function to create the employee
createEmployee();