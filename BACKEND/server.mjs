import open from "open";
import express from "express";
import fs from "fs";
import https from "https";
import loginRegRoutes from "./routes/Login&Reg.mjs"; // Updated the path to the new file name
import paymentRouter from "./routes/payment.mjs"; // Updated the path to the new file name
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const PORT = 3001;
const app = express();

// Applying Helmet to secure HTTP headers
app.use(helmet());

// Implementing HSTS to enforce HTTPS
app.use(helmet.hsts({
    //Max age set to 1 year
    maxAge: 31536000,
    //Aplying to all subdomains
    includeSubDomains: true,
    //Allowing for the web app to be preloaded in browser
    preload: true
}));

app.use(express.json());
app.use(cors());

const options = {
    key: fs.readFileSync('keys/privateKey.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
};

app.use(cors());
app.use(express.json());

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

app.use("/user", loginRegRoutes); // Updated the path to the new file name
app.use("/payment", paymentRouter); // Updated the path to the new file name

let server = https.createServer(options, app);
server.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
    open(`https://localhost:${PORT}`);
});