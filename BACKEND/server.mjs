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
import { createStream } from 'rotating-file-stream';  

const PORT = 3001;
const app = express();

// HTTPS options for secure connection
const options = {
    key: fs.readFileSync('keys/privateKey.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
};

// Applying Helmet to secure HTTP headers
app.use(helmet());
// Preventing clickjacking
app.use(helmet.frameguard({ action: 'deny' })); 
// Adding XSS protection header
app.use(helmet.xssFilter()); 
// Preventing MIME-type sniffing
app.use(helmet.noSniff()); 
// Implementing HSTS to enforce HTTPS
app.use(helmet.hsts({
    maxAge: 31536000, // One year in seconds
    includeSubDomains: true,
    preload: true
}));

// Set up rotating log files
const accessLogStream = createStream('access.log', {
    interval: '1d', // Rotate daily
    path: './log'
});

// Logging requests using Morgan with rotating log files
app.use(morgan('combined', { stream: accessLogStream }));

// Middleware to parse JSON, handle CORS, and cookie parsing
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true // Allow credentials (cookies) to be sent
}));
app.use(cookieParser());

// Secure Session Management
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', 
    resave: false,
    saveUninitialized: false, 
    cookie: {
        secure: true, 
        httpOnly: true, 
        sameSite: 'strict', 
    }
}));

// Implementing rate limiting globally 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes."
});
// Implementing rate limiting for login attempts
const loginLimiter = rateLimit({
    // 15 minutes
    windowMs: 3 * 60 * 1000, 
    // Limit to 10 login attempts per window
    max: 10, 
    message: "Too many login attempts, please try again after 15 minutes."
});
app.use("/login", loginLimiter);

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
// Hiding the X-Powered-By header to prevent attackers from knowing the server technology.
app.disable('x-powered-by');
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