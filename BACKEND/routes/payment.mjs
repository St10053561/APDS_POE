import express from "express";
import { db } from "../db/conn.mjs"; 
import checkAuth from "../check-auth.mjs";
import cors from "cors";
import { ObjectId } from 'mongodb';

const router = express.Router();
router.use(cors());

// Function to sanitize input
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.replace(/[<>]/g, "");
    }
    return input;
};

// Function to validate input
const validatePaymentInput = (data) => {
    const accountNoPattern = /^\d{9,10}$/;
    const swiftCodePattern = /^[A-Z]{4,5}\d{1,2}$/;
    if (!accountNoPattern.test(data.recipientAccountNo)) throw new Error("Invalid account number. It should have 9 to 10 digits.");
    if (!swiftCodePattern.test(data.swiftCode)) throw new Error("Invalid swift code. It should have 4 to 5 capital letters followed by 1 to 2 numbers.");
    if (!/^[A-Z]{3}$/.test(data.currency)) throw new Error("Invalid currency code. It should be a 3-letter uppercase code.");
    if (data.amount <= 0) throw new Error("Invalid amount. It must be a positive number.");
};

// Payment creation route
router.post("/", checkAuth, async (req, res) => {
    try {
        const { recipientName, recipientBank, recipientAccountNo, amount, swiftCode, username, date, currency } = req.body;
        
        if (!recipientName || !recipientBank || !recipientAccountNo || !amount || !swiftCode || !username || !currency || !date) {
            return res.status(400).send({ error: "All fields are required." });
        }

        // Validate input
        validatePaymentInput(req.body);

        const newPayment = {
            recipientName: sanitizeInput(recipientName),
            recipientBank: sanitizeInput(recipientBank),
            recipientAccountNo: sanitizeInput(recipientAccountNo),
            amount,
            swiftCode: sanitizeInput(swiftCode),
            username: sanitizeInput(username),
            date,
            currency: sanitizeInput(currency),
            status: "pending"
        };

        let collection = db.collection("payments");
        let result = await collection.insertOne(newPayment);
        res.status(201).send(result);
    } catch (error) {
        const fieldErrors = {};
        if (error.message.includes("account number")) fieldErrors.recipientAccountNo = error.message;
        if (error.message.includes("swift code")) fieldErrors.swiftCode = error.message;
        if (error.message.includes("currency code")) fieldErrors.currency = error.message;
        if (error.message.includes("amount")) fieldErrors.amount = error.message;

        res.status(400).send({ fieldErrors });
    }
});

// Fetch pending payments
router.get("/pending", checkAuth, async (req, res) => {
    try {
        let collection = db.collection("payments");
        let pendingPayments = await collection.find({ status: "pending" }).toArray();
        res.status(200).send(pendingPayments);
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch pending payments" });
    }
});

// Update payment status
router.put("/:id/status", checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).send({ error: "Invalid payment ID" });

        const { status } = req.body;
        if (!["approved", "disapproved", "pending"].includes(status)) {
            return res.status(400).send({ error: "Invalid status value" });
        }

        let collection = db.collection("payments");
        let result = await collection.updateOne(
            { _id: ObjectId(id) },
            { $set: { status: sanitizeInput(status) } }
        );

        if (result.modifiedCount === 0) return res.status(404).send({ error: "Payment not found" });

        const payment = await collection.findOne({ _id: ObjectId(id) });
        const notificationCollection = db.collection("notifications");
        await notificationCollection.insertOne({
            username: payment.username,
            message: `Payment for ${payment.recipientName} of ${payment.amount} ${payment.currency} was ${status}`,
            date: new Date(),
            read: false
        });

        res.status(200).send({ message: "Payment status updated and notification sent" });
    } catch (error) {
        res.status(500).send({ error: "Failed to update payment status" });
    }
});

// Log transaction history
router.post("/history", checkAuth, async (req, res) => {
    const { recipientName, amount, currency, status, date } = req.body;

    if (!recipientName || !amount || !currency || !status || !date) {
        return res.status(400).send({ error: "All fields are required for transaction history." });
    }

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).send({ error: "Invalid amount. It must be a positive number." });
    }

    const validCurrencies = ["ZAR", "USD", "GBP", "INR", "JPY"];
    if (!validCurrencies.includes(currency)) return res.status(400).send({ error: "Invalid currency." });

    const validStatuses = ["approved", "disapproved", "pending"];
    if (!validStatuses.includes(status)) return res.status(400).send({ error: "Invalid status." });

    const newTransaction = {
        recipientName: sanitizeInput(recipientName),
        amount: parseFloat(amount),
        currency: sanitizeInput(currency),
        status: sanitizeInput(status),
        date: new Date(date),
    };

    try {
        let collection = db.collection("transactionHistory");
        let result = await collection.insertOne(newTransaction);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({ error: "Failed to log transaction history." });
    }
});

// Fetch transaction history
router.get("/history", checkAuth, async (req, res) => {
    try {
        let collection = db.collection("transactionHistory");
        let transactionHistory = await collection.find().toArray();
        res.status(200).send(transactionHistory);
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch transaction history" });
    }
});

export default router;
