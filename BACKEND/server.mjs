import open from "open";
import express from "express";
import fs from "fs";
import https from "https";
import loginRegRoutes from "./routes/Login&Reg.mjs";
import paymentRouter from "./routes/payment.mjs";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import session from "express-session";
import mongoose from "mongoose";
import morgan from "morgan";
import { body, validationResult } from 'express-validator';
import uid2 from 'uid2';

const PORT = 3001;
const app = express();

// HTTPS options for secure connection
const options = {
    key: fs.readFileSync('keys/privateKey.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
};

// Applying Helmet to secure HTTP headers
app.use(helmet());

// Implementing HSTS to enforce HTTPS
app.use(helmet.hsts({
    maxAge: 31536000, // One year in seconds
    includeSubDomains: true,
    preload: true
}));

// Logging requests using Morgan (excluding sensitive data)
app.use(morgan('combined'));

// Middleware to parse JSON, handle CORS, and cookie parsing
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true // Allow credentials (cookies) to be sent
}));
app.use(cookieParser());

// Secure Session Management
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Using env variable for session secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Sending cookies over HTTPS
        httpOnly: true, // Preventing JavaScript access to cookies
        sameSite: 'strict',
    }
}));

// Implementing rate limiting globally (can also be applied per route as shown below)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Providing a 15 minutes window
    max: 100, // Limiting each IP to 100 requests per window
    message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// Custom middleware to apply rate limiting on specific routes like login & registration
app.use("/user", limiter);

// Set Access-Control headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// MongoDB NoSQL injection prevention
mongoose.set('sanitizeFilter', true);

// Routes
app.use("/user", loginRegRoutes); // Login and Registration Routes
app.use("/payment", paymentRouter); // Payment Routes

// Catch validation errors globally
app.use((err, req, res, next) => {
    if (err.errors && Array.isArray(err.errors)) {
        return res.status(400).json({ errors: err.errors });
    }
    next(err);
});

// Global error handler for catching any unhandled errors
app.use((err, req, res, next) => {
    console.error("Global error handler caught:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
});

// Start the HTTPS server
let server = https.createServer(options, app);
server.listen(PORT, () => {
    console.log(`Server is running securely on https://localhost:${PORT}`);
    open(`https://localhost:${PORT}`);
});

export default app;