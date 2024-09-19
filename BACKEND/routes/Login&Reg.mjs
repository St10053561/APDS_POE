import express from 'express';
import db from '../db/conn.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ExpressBrute from 'express-brute';

const router = express.Router();

var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store); // global bruteforce instance

// Customer Registration
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, username, password, confirmPassword, accountNumber, idNumber } = req.body;

        // Check if all required fields are provided
        if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !accountNumber || !idNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
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

        // Check if all required fields are provided
        if (!usernameOrAccountNumber || !password) {
            console.log('Validation failed: All fields are required');
            return res.status(400).json({ message: "All fields are required" });
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
            console.log('User not found');
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: "Authentication failed" });
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
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Find the user in the CustomerReg&Login collection
        const collection = await db.collection("CustomerReg&Login");
        const user = await collection.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Here you would typically generate a password reset token and send it via email
        // For simplicity, we'll just return a success message
        res.status(200).json({ message: "Password reset link has been sent to your email" });
    } catch (error) {
        console.log("Forgot Password Error:", error);
        res.status(500).json({ message: "Forgot Password Failed" });
    }
});

export default router;