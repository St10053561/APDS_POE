import open from "open";
import express from "express";
import fs from "fs";
import https from "https";
import loginRegRoutes from "./routes/Login&Reg.mjs"; // Updated the path to the new file name
import paymentRouter from "./routes/payment.mjs"; // Updated the path to the new file name
import cors from "cors";

const PORT = 3001;
const app = express();

app.use(express.json());
app.use(cors());

const options = {
    key: fs.readFileSync('keys/privateKey.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
};

app.use(cors());
app.use(express.json());

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