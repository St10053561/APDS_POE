import express from "express";
import { db, client } from "../db/conn.mjs"; // Import db and client from conn.mjs
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import { body, validationResult } from "express-validator";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const router = express.Router();
const store = new ExpressBrute.MemoryStore(); // Don't use this in production
const bruteforce = new ExpressBrute(store); // Global brute-force instance

// Regex patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
const accountNumberPattern = /^\d{9,10}$/; // Updated to allow 9 or 10 digits
const idNumberPattern = /^\d{13}$/; // Updated to allow exactly 13 digits
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Password pattern

const secretKey = process.env.SECRET_KEY; // Read secret key from environment variable

// Customer Registration
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, confirmPassword, accountNumber, idNumber } = req.body;

    const errors = [];

    // Check if all required fields are provided
    if (!firstName) errors.push({ field: 'firstName', message: 'First name is required' });
    if (!lastName) errors.push({ field: 'lastName', message: 'Last name is required' });
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!username) errors.push({ field: 'username', message: 'Username is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });
    if (!confirmPassword) errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
    if (!accountNumber) errors.push({ field: 'accountNumber', message: 'Account number is required' });
    if (!idNumber) errors.push({ field: 'idNumber', message: 'ID number is required' });

    // Validate email, username, account number, ID number, and password
    if (email && !emailPattern.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
    if (username && !usernamePattern.test(username)) {
      errors.push({ field: 'username', message: 'Invalid username format' });
    }
    if (accountNumber && (isNaN(accountNumber) || !accountNumberPattern.test(accountNumber))) {
      errors.push({ field: 'accountNumber', message: 'Invalid account number format. It should be a 9 or 10 digit number.' });
    }
    if (idNumber && (isNaN(idNumber) || !idNumberPattern.test(idNumber))) {
      errors.push({ field: 'idNumber', message: 'Invalid ID number format. It should be a 13 digit number.' });
    }
    if (password && !passwordPattern.test(password)) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character' });
    }
    if (password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    // Check for duplicate username or email
    const collection = await db.collection("CustomerReg&Login");
    const existingUser = await collection.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        errors.push({ field: 'username', message: 'Username already exists' });
      } else if (existingUser.email === email) {
        errors.push({ field: 'email', message: 'Email already exists' });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Hash the password asynchronously
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user document
    let newDocument = {
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      accountNumber,
      idNumber
    };

    // Insert the new user into the CustomerReg&Login collection
    let result = await collection.insertOne(newDocument);

    res.status(201).json({ message: "User created successfully", result });
  } catch (error) {
    console.log("Signup Error:", error);
    res.status(500).json({ message: "Signup Failed" });
  }
});

// Login
router.post("/login", bruteforce.prevent, async (req, res) => {
  try {
    const { usernameOrAccountNumber, password } = req.body;

    const errors = [];

    // Check if all required fields are provided
    if (!usernameOrAccountNumber) errors.push({ field: 'usernameOrAccountNumber', message: 'Username or Account Number is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });

    // Validate username or account number
    if (usernameOrAccountNumber && !usernamePattern.test(usernameOrAccountNumber) && (isNaN(usernameOrAccountNumber) || !accountNumberPattern.test(usernameOrAccountNumber))) {
      errors.push({ field: 'usernameOrAccountNumber', message: 'Invalid username or account number format' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Find the user in the CustomerReg&Login collection using either username or accountNumber
    const collection = await db.collection("CustomerReg&Login");
    const user = await collection.findOne({
      $or: [
        { username: usernameOrAccountNumber },
        { accountNumber: usernameOrAccountNumber }
      ]
    });

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ errors: [{ field: 'general', message: 'Username or password could be incorrect' }] });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ errors: [{ field: 'general', message: 'Username or password could be incorrect' }] });
    }
    else {
      // Authentication successful
      const token = jwt.sign({ username: user.username, accountNumber: user.accountNumber }, secretKey, { expiresIn: "30m" });
      res.status(200).json({ message: "Authentication successful", token, username: user.username, accountNumber: user.accountNumber });
    }
  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Login Failed" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { identifier, newPassword, confirmPassword } = req.body;

    // Check if all required fields are provided
    if (!identifier || !newPassword || !confirmPassword) {
      console.log("Missing fields:", { identifier, newPassword, confirmPassword });
      return res.status(400).json({ errors: [{ field: 'general', message: "All fields are required" }] });
    }

    // Validate identifier (username or account number) and password
    if (!usernamePattern.test(identifier) && !accountNumberPattern.test(identifier)) {
      console.log("Invalid identifier format:", identifier);
      return res.status(400).json({ errors: [{ field: 'identifier', message: "Invalid username or account number format" }] });
    }
    if (!passwordPattern.test(newPassword)) {
      console.log("Invalid password format:", newPassword);
      return res.status(400).json({ errors: [{ field: 'newPassword', message: "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character" }] });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match:", { newPassword, confirmPassword });
      return res.status(400).json({ errors: [{ field: 'confirmPassword', message: "Passwords do not match" }] });
    }

    // Find the user in the CustomerReg&Login collection using either username or accountNumber
    const collection = await db.collection("CustomerReg&Login");
    const user = await collection.findOne({
      $or: [
        { username: identifier },
        { accountNumber: identifier }
      ]
    });

    if (!user) {
      console.log("User not found:", identifier);
      return res.status(404).json({ errors: [{ field: 'identifier', message: "User not found" }] });
    }

    // Hash the new password asynchronously
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    const updateResult = await collection.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    if (updateResult.modifiedCount === 0) {
      console.log("Password update failed for user:", identifier);
      return res.status(500).json({ errors: [{ field: 'general', message: "Password update failed" }] });
    }

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.log("Forgot Password Error:", error);
    res.status(500).json({ errors: [{ field: 'general', message: "Forgot Password Failed" }] });
  }
});
export default router;