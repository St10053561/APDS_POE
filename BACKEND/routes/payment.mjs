import express from "express";
import { db } from "../db/conn.mjs"; // Use named import for db
import checkAuth from "../check-auth.mjs";
import cors from "cors";
import { ObjectId } from 'mongodb'; // Import ObjectId from MongoDB

const router = express.Router();
router.use(cors());

// Function to sanitize input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.replace(/[<>]/g, ""); // Remove potentially harmful characters
  }
  return input;
};

router.post("/", checkAuth, async (req, res) => {
  try {
    const {
      recipientName,
      recipientBank,
      recipientAccountNo,
      amount,
      swiftCode,
      username,
      date,
      currency,
    } = req.body;

    // Define regex patterns
    const accountNoPattern = /^\d{9,10}$/;
    const swiftCodePattern = /^[A-Z]{4,5}\d{1,2}$/;

    // Validate account number
    if (!accountNoPattern.test(recipientAccountNo)) {
      return res.status(400).send({
        fieldErrors: { recipientAccountNo: "Invalid account number. It should have 9 to 10 digits." },
      });
    }

    // Validate swift code
    if (!swiftCodePattern.test(swiftCode)) {
      return res.status(400).send({
        fieldErrors: { swiftCode: "Invalid swift code. It should have 4 to 5 capital letters followed by 1 to 2 numbers." },
      });
    }

    // Optionally validate currency (e.g., must be a 3-letter code)
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).send({
        fieldErrors: { currency: "Invalid currency code. It should be a 3-letter uppercase code." },
      });
    }

    // Validate amount (must be a positive number)
    if (amount <= 0) {
      return res.status(400).send({
        fieldErrors: { amount: "Invalid amount. It must be a positive number." },
      });
    }

    const newPayment = {
      recipientName: sanitizeInput(recipientName),
      recipientBank: sanitizeInput(recipientBank),
      recipientAccountNo,
      amount,
      swiftCode: sanitizeInput(swiftCode),
      username: sanitizeInput(username),
      date,
      currency: sanitizeInput(currency),
      status: "pending" // Add status field
    };

    let collection = db.collection("payments");
    let result = await collection.insertOne(newPayment);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error storing payment:", error);
    res.status(500).send({ error: "Failed to store payment" });
  }
});

// Endpoint to fetch pending payments
router.get("/pending", checkAuth, async (req, res) => {
  try {
    let collection = db.collection("payments");
    let pendingPayments = await collection.find({ status: "pending" }).toArray();
    res.status(200).send(pendingPayments);
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    res.status(500).send({ error: "Failed to fetch pending payments" });
  }
});

// Endpoint to update payment status
router.put("/:id/status", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid payment ID" });
    }

    const { status } = req.body;

    // Validate status
    if (!["approved", "disapproved", "pending"].includes(status)) {
      return res.status(400).send({ error: "Invalid status value" });
    }

    let collection = db.collection("payments");
    let result = await collection.updateOne(
      { _id: ObjectId(id) }, // Use ObjectId directly
      { $set: { status: status } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({ error: "Payment not found" });
    }

    res.status(200).send({ message: "Payment status updated successfully" });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).send({ error: "Failed to update payment status" });
  }
});

// Endpoint to fetch approved and disapproved payments for a specific user
router.get("/status", checkAuth, async (req, res) => {
  try {
    const { username } = req.query;

    // Sanitize username input
    const sanitizedUsername = sanitizeInput(username);

    let collection = db.collection("payments");
    let payments = await collection.find({
      username: sanitizedUsername, // Use sanitized username directly
      status: { $in: ["approved", "disapproved"] }
    }).toArray();

    res.status(200).send(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).send({ error: "Failed to fetch payments" });
  }
});

// Endpoint to log transaction history
router.post("/history", checkAuth, async (req, res) => {
  const { recipientName, amount, currency, status, date } = req.body;

  const newTransaction = {
    recipientName: sanitizeInput(recipientName),
    amount,
    currency: sanitizeInput(currency),
    status,
    date,
  };

  try {
    let collection = db.collection("transactionHistory");
    let result = await collection.insertOne(newTransaction);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error logging transaction history:", error);
    res.status(400).send(error);
  }
});

// Endpoint to fetch transaction history
router.get("/history", checkAuth, async (req, res) => {
  try {
    let collection = db.collection("transactionHistory");
    let transactionHistory = await collection.find().toArray();
    res.status(200).send(transactionHistory);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).send({ error: "Failed to fetch transaction history" });
  }
});

export default router;