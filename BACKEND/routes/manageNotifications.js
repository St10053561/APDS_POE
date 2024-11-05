import express from 'express';
import { db } from '../db/conn.mjs'; // Use named import for db
import checkAuth from '../check-auth.mjs';
import cors from 'cors';

const router = express.Router();
router.use(cors());

// Endpoint to log notifications
router.post("/", checkAuth, async (req, res) => {
  const { username, recipientName, amount, currency, status, date } = req.body;

  // Validate input data
  if (typeof username !== 'string' || username.trim() === '') {
    return res.status(400).send({ error: "Invalid username" });
  }
  if (typeof recipientName !== 'string' || recipientName.trim() === '') {
    return res.status(400).send({ error: "Invalid recipient name" });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).send({ error: "Invalid amount" });
  }
  if (typeof currency !== 'string' || currency.trim() === '') {
    return res.status(400).send({ error: "Invalid currency" });
  }
  if (typeof status !== 'string' || status.trim() === '') {
    return res.status(400).send({ error: "Invalid status" });
  }
  if (typeof date !== 'string' || date.trim() === '') {
    return res.status(400).send({ error: "Invalid date" });
  }

  const newNotification = {
    username,
    recipientName,
    amount,
    currency,
    status,
    date,
  };

  try {
    let collection = db.collection("notifications");
    let result = await collection.insertOne(newNotification);
    console.log("New notification logged:", newNotification); // Debug message
    res.status(201).send(result);
  } catch (error) {
    console.error("Error logging notification:", error);
    res.status(400).send({ error: "Failed to log notification" });
  }
});

// Endpoint to fetch notifications
router.get("/notify", checkAuth, async (req, res) => {
  const { username } = req.query;

  // Validate username to prevent injection
  if (typeof username !== 'string' || username.trim() === '') {
    return res.status(400).send({ error: "Invalid username" });
  }

  try {
    let collection = db.collection("notifications"); // Ensure you're querying the correct collection
    let notifications = await collection.find({ username: { $eq: username } }).toArray(); // Use safe query
    console.log("Fetched notifications for user:", username, notifications); // Debug message
    res.status(200).send(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send({ error: "Failed to fetch notifications" });
  }
});

export default router;