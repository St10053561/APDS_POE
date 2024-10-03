import express from "express";
import db from "../db/conn.mjs";
import checkAuth from "../check-auth.mjs";
import cors from 'cors'; // Import CORS

const router = express.Router();
router.use(cors()); // Use CORS middleware

// Creates a new payment record in the "payments" collection.
router.post("/", checkAuth, async (req, res) => {
    try {
        const { recipientName, recipientBank, recipientAccountNo, amount, swiftCode, username, date, currency } = req.body;

        // Create a new payment object
        const newPayment = {
            recipientName,
            recipientBank,
            recipientAccountNo,
            amount,
            swiftCode,
            username, // Store the username from the request body
            date, // Store the current date from the request body
            currency // Store the selected currency from the request body
        };

        // Insert the new payment into the "payments" collection
        let collection = db.collection("payments");
        let result = await collection.insertOne(newPayment);
        res.status(201).send(result);
    } catch (error) {
        console.error('Error storing payment:', error); // Log error
        res.status(500).send({ error: 'Failed to store payment' });
    }
});

export default router;