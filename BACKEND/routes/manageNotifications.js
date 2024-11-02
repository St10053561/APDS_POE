import express from 'express';
import { db } from '../db/conn.mjs'; // Use named import for db
import checkAuth from '../check-auth.mjs';
import cors from 'cors';

const router = express.Router();
router.use(cors());

// Endpoint to log notifications
router.post("/", checkAuth, async (req, res) => {
  const { username, recipientName, amount, currency, status, date } = req.body;

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
    res.status(201).send(result);
  } catch (error) {
    console.error("Error logging notification:", error);
    res.status(400).send(error);
  }
});

export default router;