import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";

const router = express.Router();

var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store); // global bruteforce instance

// Customer Registration
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword,
      accountNumber,
      idNumber,
    } = req.body;

    // Regex patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9]{3,10}$/;
    const nameRegex = /^[a-zA-Z]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    const accountNumberRegex = /^\d{9,10}$/;
    const idNumberRegex = /^\d{13}$/;

    // Check if all required fields are provided
    if (
      !firstName ||
      !lastName ||
      !email ||
      !username ||
      !password ||
      !confirmPassword ||
      !accountNumber ||
      !idNumber
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email, username, password, account number, and ID number
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!usernameRegex.test(username)) {
      return res
        .status(400)
        .json({ message: "Username must be 3-10 alphanumeric characters" });
    }
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      return res
        .status(400)
        .json({ message: "Name and surname must contain only letters" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long, contain at least one number, one uppercase and one lowercase letter",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!accountNumberRegex.test(accountNumber)) {
      return res
        .status(400)
        .json({ message: "Account number must be 9-10 digits" });
    }
    if (!idNumberRegex.test(idNumber)) {
      return res.status(400).json({ message: "ID number must be 13 digits" });
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
      idNumber,
    };

    // Insert the new user into the CustomerReg&Login collection
    let collection = await db.collection("CustomerReg&Login");
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

    // Regex patterns
    const usernameRegex = /^[a-zA-Z0-9]{3,10}$/;
    const accountNumberRegex = /^\d{9,10}$/;

    // Check if all required fields are provided
    if (!usernameOrAccountNumber || !password) {
      console.log("Validation failed: All fields are required");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate username or account number
    if (
      !usernameRegex.test(usernameOrAccountNumber) &&
      !accountNumberRegex.test(usernameOrAccountNumber)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid username or account number format" });
    }

    // Find the user in the CustomerReg&Login collection using either username or accountNumber
    const collection = await db.collection("CustomerReg&Login");
    const user = await collection.findOne({
      $or: [
        { username: usernameOrAccountNumber },
        { accountNumber: usernameOrAccountNumber },
      ],
    });

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Authentication failed" });
    } else {
      // Authentication successful
      const token = jwt.sign(
        { username: user.username },
        "this_secret_should_be_Longer_than_it_is",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: "Authentication successful",
        token,
        username: user.username,
      });
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
    await collection.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.log("Forgot Password Error:", error);
    res.status(500).json({ message: "Forgot Password Failed" });
  }
});

export default router;
