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

// Function to validate input
const validatePaymentInput = (data) => {
  const accountNoPattern = /^\d{9,10}$/;
  const swiftCodePattern = /^[A-Z]{4,5}\d{1,2}$/;

  if (!accountNoPattern.test(data.recipientAccountNo)) {
    throw new Error("Invalid account number. It should have 9 to 10 digits.");
  }
  if (!swiftCodePattern.test(data.swiftCode)) {
    throw new Error("Invalid swift code. It should have 4 to 5 capital letters followed by 1 to 2 numbers.");
  }
  if (!/^[A-Z]{3}$/.test(data.currency)) {
    throw new Error("Invalid currency code. It should be a 3-letter uppercase code.");
  }
  if (data.amount <= 0) {
    throw new Error("Invalid amount. It must be a positive number.");
  }
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

    // Validate input
    validatePaymentInput(req.body);

    const newPayment = {
      recipientName: sanitizeInput(recipientName),
      recipientBank: sanitizeInput(recipientBank),
      recipientAccountNo: sanitizeInput(recipientAccountNo), // Sanitize account number
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

    // Create a fieldErrors object to hold validation errors
    const fieldErrors = {};

    // Check for specific validation errors and populate fieldErrors
    if (error.message.includes("account number")) {
      fieldErrors.recipientAccountNo = "Invalid account number. It should have 9 to 10 digits.";
    }
    if (error.message.includes("swift code")) {
      fieldErrors.swiftCode = "Invalid swift code. It should have 4 to 5 capital letters followed by 1 to 2 numbers.";
    }
    if (error.message.includes("currency code")) {
      fieldErrors.currency = "Invalid currency code. It should be a 3-letter uppercase code.";
    }
    if (error.message.includes("amount")) {
      fieldErrors.amount = "Invalid amount. It must be a positive number.";
    }

    // Send the fieldErrors object in the response
    res.status(400).send({ fieldErrors });
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
      { _id: new ObjectId(id) }, // Use new ObjectId here
      { $set: { status: sanitizeInput(status) } } // Sanitize status before using it
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

router.post("/history", checkAuth, async (req, res) => {
  console.log("Received request to log transaction history:", req.body); // Add this line
  const { recipientName, amount, currency, status, date } = req.body;

    // Validate input
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).send({ error: "Invalid amount. It must be a positive number." });
  }

  const validCurrencies = ["ZAR", "USD", "GBP", "INR", "JPY"]; // Add valid currencies as needed
  if (!validCurrencies.includes(currency)) {
    return res.status(400).send({ error: "Invalid currency." });
  }

  const validStatuses = ["approved", "disapproved", "pending"]; // Define valid statuses
  if (!validStatuses.includes(status)) {
    return res.status(400).send({ error: "Invalid status." });
  }

  const newTransaction = {
    recipientName: sanitizeInput(recipientName),
    amount: parseFloat(amount), // Ensure amount is a number
    currency: sanitizeInput(currency),
    status: sanitizeInput(status), // Sanitize status before using it
    date: new Date(date), // Ensure date is a valid date object
  };

  try {
    let collection = db.collection("transactionHistory");
    let result = await collection.insertOne(newTransaction);
    console.log("Transaction history stored:", result); // Log the result of the insert
    res.status(201).send(result);
  } catch (error) {
    console.error("Error logging transaction history:", error);
    res.status(500).send({ error: "Failed to log transaction history." });
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