import express from "express";
import { db, client } from "../db/conn.mjs"; // Import db and client from conn.mjs
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import { body, validationResult } from "express-validator";

const router = express.Router();
const store = new ExpressBrute.MemoryStore(); // Don't use this in production
const bruteforce = new ExpressBrute(store); // Global brute-force instance

// Customer Registration
router.post("/register", [
  body('firstName').isAlpha().withMessage('First name must contain only letters'),
  body('lastName').isAlpha().withMessage('Last name must contain only letters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('username').isAlphanumeric().isLength({ min: 3, max: 10 }).withMessage('Username must be 3-10 alphanumeric characters'),
  body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/).withMessage('Password must be at least 6 characters long, contain at least one number, one uppercase and one lowercase letter'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('accountNumber').isLength({ min: 9, max: 10 }).withMessage('Account number must be 9-10 digits'),
  body('idNumber').isLength({ min: 13, max: 13 }).withMessage('ID number must be 13 digits')
], async (req, res) => {
  console.log('Register endpoint hit');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, username, password, accountNumber, idNumber } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);

    const result = await db.collection('users').insertOne({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      accountNumber,
      idNumber
    });

    console.log('Insert Result:', result);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Signup Failed" });
  }
});

// Login
router.post("/login", bruteforce.prevent, [
  body('usernameOrAccountNumber').notEmpty().withMessage('Username or account number is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const { usernameOrAccountNumber, password } = req.body;

    // Check if all required fields are provided
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Find the user in the CustomerReg&Login collection using either username or accountNumber
    const collection = await db.collection("users");
    const user = await collection.findOne({
      $or: [
        { username: usernameOrAccountNumber },
        { accountNumber: usernameOrAccountNumber }
      ]
    });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: "Incorrect username or password" });
    } else {
      // Authentication successful
      const token = jwt.sign({ username: user.username }, "this_secret_should_be_Longer_than_it_is", { expiresIn: "1h" });
      res.status(200).json({ message: "Authentication successful", token, username: user.username });
      console.log("Your new token is", token);
    }
  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Login Failed" });
  }
});


// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
      const { username, newPassword, confirmPassword } = req.body;

      // Check if all required fields are provided
      if (!username || !newPassword || !confirmPassword) {
          return res.status(400).json({ message: "All fields are required" });
      }

      // Validate username and password
      if (!usernamePattern.test(username)) {
          return res.status(400).json({ message: "Invalid username format" });
      }
      if (!passwordPattern.test(newPassword)) {
          return res.status(400).json({ message: "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character" });
      }

      // Check if newPassword and confirmPassword match
      if (newPassword !== confirmPassword) {
          return res.status(400).json({ message: "Passwords do not match" });
      }

      // Find the user in the CustomerReg&Login collection
      const collection = await db.collection("CustomerReg&Login");
      const user = await collection.findOne({ username });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Hash the new password asynchronously
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update the user's password in the database
      await collection.updateOne({ username }, { $set: { password: hashedPassword } });

      res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
      console.log("Forgot Password Error:", error);
      res.status(500).json({ message: "Forgot Password Failed" });
  }
});


export default router;