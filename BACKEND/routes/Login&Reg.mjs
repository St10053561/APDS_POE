import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import { body, validationResult } from "express-validator";

const router = express.Router();
const store = new ExpressBrute.MemoryStore(); // Don't use this in production
const bruteforce = new ExpressBrute(store); // Global brute-force instance

// Customer Registration
router.post("/register", [
  body('firstName').matches(/^[A-Za-z\s]+$/).withMessage('First name must contain only letters and spaces'),
  body('lastName').matches(/^[A-Za-z\s]+$/).withMessage('Last name must contain only letters and spaces'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('username').isAlphanumeric().isLength({ min: 3, max: 10 }).withMessage('Username must be 3-10 alphanumeric characters'),
  body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/).withMessage('Password must be at least 6 characters long, contain at least one number, one uppercase and one lowercase letter'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
  body('accountNumber').matches(/^\d{9,10}$/).withMessage('Account number must be 9-10 digits'),
  body('idNumber').matches(/^\d{13}$/).withMessage('ID number must be 13 digits')
], async (req, res) => {
  console.log("Register endpoint hit");

  // Validate input using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation Errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, username, password, accountNumber, idNumber } = req.body;

    // Hash the password asynchronously
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Hashed Password:", hashedPassword);

    // Create a new user document
    const newDocument = {
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      accountNumber,
      idNumber,
    };

    // Insert the new user into the CustomerReg&Login collection
    const collection = await db.collection("CustomerReg&Login");
    const result = await collection.insertOne(newDocument);
    console.log("Insert Result:", result);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Signup Failed" });
  }
});

// Login
router.post("/login", bruteforce.prevent, async (req, res) => {
    try {

        const { usernameOrAccountNumber, password } = req.body;

        // Regex patterns
        const usernameRegex = /^[a-zA-Z0-9]{3,10}$/;
        const accountNumberRegex = /^\d{9,10}$/;

        // Check if all required fields are provided
        if (!usernameOrAccountNumber || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate username or account number
        if (
            !usernameRegex.test(usernameOrAccountNumber) &&
            !accountNumberRegex.test(usernameOrAccountNumber)
        ) {
            return res.status(400).json({ message: "Invalid username or account number format" });
        }

        // Find the user in the CustomerReg&Login collection using safe operators
        const user = await db.collection("CustomerReg&Login").findOne({
            $or: [
                { username: req.body.usernameOrAccountNumber },
                { accountNumber: req.body.usernameOrAccountNumber }
            ]
        }); 

        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Authentication successful
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "this_secret_should_be_Longer_than_it_is",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Authentication successful",
            token,
            username: user.username,
        });
        console.log("Your new token is", token);
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Login Failed" });
    }
});


// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { username, newPassword, confirmPassword } = req.body;

    // Regex patterns
    const usernameRegex = /^[a-zA-Z0-9]{3,10}$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    // Check if all required fields are provided
    if (!username || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate username
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: "Invalid username format" });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate password strength
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: "Password is not strong enough" });
    }

    // Find the user in the CustomerReg&Login collection using safe operators
    const user = await db.collection("CustomerReg&Login").findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password asynchronously
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    await db.collection("CustomerReg&Login").updateOne({ username: req.body.username }, { $set: { password: hashedPassword } });

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Forgot Password Failed" });
  }
});

export default router;
