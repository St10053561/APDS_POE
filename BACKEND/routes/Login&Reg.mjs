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

export default router;