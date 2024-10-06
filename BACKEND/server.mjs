import open from "open";
import express from "express";
import fs from "fs";
import https from "https";
import loginRegRoutes from "./routes/Login&Reg.mjs";
import paymentRouter from "./routes/payment.mjs";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import cookieParser from "cookie-parser"; 
import session from "express-session";


const PORT = 3001;
const app = express();

// Applying Helmet to secure HTTP headers
app.use(helmet());

// Implementing HSTS to enforce HTTPS
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
}));

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Use an environment variable or fallback
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true, // Send cookies only over HTTPS
        httpOnly: true, // Prevent JavaScript access to cookies
        sameSite: 'strict' // Enforce CSRF protection
    }
}));

// HTTPS options
const options = {
    key: fs.readFileSync('keys/privateKey.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
};

// Implementing rate limiting for the API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});

// Implementing rate limiting for the login and register routes
app.use("/user", limiter);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

// Routes
app.use("/user", loginRegRoutes); 
app.use("/payment", paymentRouter); 

// Starting the server
let server = https.createServer(options, app);
server.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
    open(`https://localhost:${PORT}`);
});
