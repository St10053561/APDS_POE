import express from "express";
import { db } from "../db/conn.mjs"; // Use named import for db
import checkAuth from "../check-auth.mjs";
import cors from "cors";

const router = express.Router();
router.use(cors());

router.post("/", checkAuth, async (req, res) => {
  try {
    const {
      recipientName,
      recipientBank,
      recipientAccountNo,
      amount,
      swiftCode,
      username,
      date,
      currency,
    } = req.body;

    // Define regex patterns
    const accountNoPattern = /^\d{9,10}$/;
    const swiftCodePattern = /^[A-Z]{4,5}\d{1,2}$/;

    // Validate account number
    if (!accountNoPattern.test(recipientAccountNo)) {
      return res.status(400).send({
        fieldErrors: { recipientAccountNo: "Invalid account number. It should have 9 to 10 digits." },
      });
    }

    // Validate swift code
    if (!swiftCodePattern.test(swiftCode)) {
      return res.status(400).send({
        fieldErrors: { swiftCode: "Invalid swift code. It should have 4 to 5 capital letters followed by 1 to 2 numbers." },
      });
    }

    // Optionally validate currency (e.g., must be a 3-letter code)
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).send({
        fieldErrors: { currency: "Invalid currency code. It should be a 3-letter uppercase code." },
      });
    }

    // Validate amount (must be a positive number)
    if (amount <= 0) {
      return res.status(400).send({
        fieldErrors: { amount: "Invalid amount. It must be a positive number." },
      });
    }

    const newPayment = {
      recipientName,
      recipientBank,
      recipientAccountNo,
      amount,
      swiftCode,
      username,
      date,
      currency,
    };

    let collection = db.collection("payments");
    let result = await collection.insertOne(newPayment);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error storing payment:", error);
    res.status(500).send({ error: "Failed to store payment" });
  }
});

export default router;