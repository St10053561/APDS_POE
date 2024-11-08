import express from "express";
import { db } from "../db/conn.mjs"; // Import db from conn.mjs
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import dotenv from "dotenv";
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

dotenv.config(); // Load environment variables from .env file

const router = express.Router();
const store = new ExpressBrute.MemoryStore(); // Don't use this in production
const bruteforce = new ExpressBrute(store); // Global brute-force instance

const secretKey = process.env.SECRET_KEY; // Read secret key from environment variable

// Function to sanitize input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.replace(/[<>]/g, ""); // Remove potentially harmful characters
  }
  return input;
};

// Rate limiter for forgot password
const forgotPasswordLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 requests per window
    message: "Too many password reset attempts, please try again after 15 minutes."
});

// Employee Login
router.post("/emplogin", [
    body('username').isString().trim().escape(),
    body('password').isString().trim().escape()
], bruteforce.prevent, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    const sanitizedUsername = sanitizeInput(username);

    // Find the employee in the Employee collection
    const collection = await db.collection("Employees");
    const employee = await collection.findOne({ username: sanitizedUsername }); // Safe comparison

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

// Employee Forgot Password
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  try {
    const { username, newPassword, confirmPassword } = req.body;

    // Check if all required fields are provided
    if (!username || !newPassword || !confirmPassword) {
      console.log("Missing fields:", { username, newPassword, confirmPassword });
      return res.status(400).json({ errors: [{ field: 'general', message: "All fields are required" }] });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match:", { newPassword, confirmPassword });
      return res.status(400).json({ errors: [{ field: 'confirmPassword', message: "Passwords do not match" }] });
    }

    // Sanitize username
    const sanitizedUsername = sanitizeInput(username);

    // Find the employee in the Employees collection using sanitized username
    const collection = await db.collection("Employees");
    const employee = await collection.findOne({ username: sanitizedUsername }); // Safe comparison

    if (!employee) {
      console.log("Employee not found:", sanitizedUsername);
      return res.status(404).json({ errors: [{ field: 'username', message: "Employee not found" }] });
    }

    // Hash the new password asynchronously
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the employee's password in the database
    const updateResult = await collection.updateOne({ _id: employee._id }, { $set: { password: hashedPassword } });

    if (updateResult.modifiedCount === 0) {
      console.log("Password update failed for employee:", sanitizedUsername);
      return res.status(500).json({ errors: [{ field: 'general', message: "Password update failed" }] });
    }

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.log("Forgot Password Error:", error);
    res.status(500).json({ errors: [{ field: 'general', message: "Forgot Password Failed" }] });
  }
});

export default router;