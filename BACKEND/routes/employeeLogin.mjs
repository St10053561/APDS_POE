import express from "express";
import { db } from "../db/conn.mjs"; // Import db from conn.mjs
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const router = express.Router();
const store = new ExpressBrute.MemoryStore(); // Don't use this in production
const bruteforce = new ExpressBrute(store); // Global brute-force instance

const secretKey = process.env.SECRET_KEY; // Read secret key from environment variable

// Employee Login
router.post("/emplogin", bruteforce.prevent, async (req, res) => {
  try {
    const { username, password } = req.body;

    const errors = [];

    // Check if all required fields are provided
    if (!username) errors.push({ field: 'username', message: 'Username is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Find the employee in the Employee collection
    const collection = await db.collection("Employees"); // Change to your employee collection name
    const employee = await collection.findOne({ username });

    if (!employee) {
      console.log("Employee not found");
      return res.status(401).json({ errors: [{ field: 'general', message: 'Username or password could be incorrect' }] });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ errors: [{ field: 'general', message: 'Username or password could be incorrect' }] });
    } else {
      // Authentication successful
      const token = jwt.sign({ username: employee.username }, secretKey, { expiresIn: "30m" });
      res.status(200).json({ message: "Authentication successful", token, username: employee.username });
    }
  } catch (error) {
    console.log("Employee Login Error:", error);
    res.status(500).json({ message: "Login Failed" });
  }
});

export default router;