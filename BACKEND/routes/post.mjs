import express from "express"; // Import the express module
import db from "../db/conn.mjs"; // Import the database connection module
import { ObjectId } from "mongodb"; // Import the ObjectId class from the mongodb module
import checkAuth from "../check-auth.mjs"; // Correctly import the checkAuth middleware
import multer from "multer"; // Import multer for handling file uploads

const router = express.Router(); // Create a new router object
const upload = multer({ dest: 'uploads/' }); // Configure multer to save files to the 'uploads' directory

// Purpose: Fetches all records from the "posts" collection in the database.
router.get("/", async (req, res) => {
    let collection = await db.collection("posts"); // Get the "posts" collection from the database
    let results = await collection.find({}).toArray(); // Find all documents in the collection and convert them to an array
    res.status(200).send(results); // Send the results as the response with a status code of 200 (OK)
});

// Creates a new record in the "posts" collection.
router.post("/upload", checkAuth, upload.single('image'), async (req, res) => {
    let newDocument = {
        user: req.body.user, // Get the user from the request body
        content: req.body.content, // Get the content from the request body
        image: req.file ? req.file.filename : null // Save the filename of the uploaded image
    };
    let collection = await db.collection("posts"); // Get the "posts" collection from the database
    let result = await collection.insertOne(newDocument); // Insert the new document into the collection
    res.status(201).send(result); // Send the result as the response with a status code of 201 (Created)
});

// Updates a specific record by ID in the "posts" collection.
router.patch("/:id", checkAuth, upload.single('image'), async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) }; // Create a query to find the document by ID
    const updates = {
        $set: {
            user: req.body.user, // Update the user field
            content: req.body.content, // Update the content field
            image: req.file ? req.file.filename : req.body.image // Update the image if a new file is uploaded
        }
    };

    let collection = await db.collection("posts"); // Get the "posts" collection from the database
    let result = await collection.updateOne(query, updates); // Update the document in the collection

    res.status(200).send(result); // Send the result as the response with a status code of 200 (OK)
});

// Fetches a specific record by ID from the "posts" Collection.
router.get("/:id", async (req, res) => {
    let collection = await db.collection("posts"); // Get the "posts" collection from the database
    let query = { _id: new ObjectId(req.params.id) }; // Create a query to find the document by ID
    let result = await collection.findOne(query); // Find the document in the collection
    
    if (!result) res.status(404).send("Not Found"); // If no document is found, send a 404 status
    else res.status(200).send(result); // If the document is found, send it as the response with a 200 status
});

// Deletes a specific record by ID from the "posts" collection.
router.delete("/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) }; // Create a query to find the document by ID

    const collection = await db.collection("posts"); // Get the "posts" collection from the database
    let result = await collection.deleteOne(query); // Delete the document from the collection

    res.status(200).send(result); // Send the result as the response with a status code of 200 (OK)
});

export default router; // Export the router object as the default export

// Summary:
// GET /: Fetches all records.
// POST /upload: Creates a new record.
// PATCH /:id: Updates a specific record by ID.
// GET /:id: Fetches a specific record by ID.
// DELETE /:id: Deletes a specific record by ID.
// These routes allow you to perform CRUD (Create, Read, Update, Delete) operations on the "posts" collection in your MongoDB database.