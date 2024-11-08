import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import validator from 'validator';
import crypto from 'crypto';
import winston from 'winston';

// Load environment variables from .env file
dotenv.config();

const uri = process.env.ATLAS_URL; // Use the connection string from the .env file
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, ssl: true });

// Use an environment variable for the password
const password = process.env.EMPLOYEE_PASSWORD; // Your specified plaintext password from .env
const saltRounds = 10;

// Validate and sanitize username
const username = validator.escape("emp1");

// Encrypt sensitive data
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

const encryptedFirstName = encrypt("John");
const encryptedLastName = encrypt("Doe");

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
        logger.error("Error hashing password:", err);
    } else {
        logger.info("Hashed password:", hash);
        const employeeRecord = {
            username: username,
            password: hash,
            firstName: encryptedFirstName,
            lastName: encryptedLastName,
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
                logger.info(`Collection '${collectionName}' created.`);
            } else {
                logger.info(`Collection '${collectionName}' already exists.`);
            }

            // Insert the employee record
            const collection = database.collection(collectionName);
            const result = await collection.insertOne(employeeRecord);
            logger.info(`New employee created with the following id: ${result.insertedId}`);
        } catch (error) {
            logger.error("Error inserting employee record:", error);
        } finally {
            await client.close();
        }
    }
});