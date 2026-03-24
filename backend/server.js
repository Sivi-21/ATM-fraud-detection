const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

let otpStore = {};
let fraudLogs = [];
let tempTokens = {};

// LOGIN
app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "1234") {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[username] = otp;

        // Generate temp token for 2FA
        const tempToken = jwt.sign({ username, stage: '2fa' }, "secret", { expiresIn: "10m" });
        tempTokens[tempToken] = username;

        console.log("🔐 OTP:", otp);

        res.json({
            success: true,
            message: "OTP sent",
            tempToken: tempToken,
            username: username,
            email: "admin@atmguard.com",
            deliveryMethod: "email",
            demoOtp: otp
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// VERIFY OTP
app.post("/api/auth/verify-2fa", (req, res) => {
    const { tempToken, code } = req.body;

    try {
        const decoded = jwt.verify(tempToken, "secret");
        const username = decoded.username;

        if (otpStore[username] == code) {
            const token = jwt.sign({ username }, "secret", { expiresIn: "1h" });

            // Clean up
            delete otpStore[username];
            delete tempTokens[tempToken];

            res.json({
                success: true,
                token: token,
                user: {
                    id: "1",
                    username: username,
                    email: "admin@atmguard.com",
                    role: "admin",
                    name: "Admin User"
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid OTP" });
        }
    } catch (err) {
        res.status(401).json({ success: false, message: "Invalid or expired session" });
    }
});

// RESEND 2FA
app.post("/api/auth/resend-2fa", (req, res) => {
    const { tempToken } = req.body;

    try {
        const decoded = jwt.verify(tempToken, "secret");
        const username = decoded.username;

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[username] = otp;

        console.log("🔐 Resent OTP:", otp);
        res.json({ success: true, message: "OTP resent", demoOtp: otp });
    } catch (err) {
        res.status(401).json({ success: false, message: "Invalid or expired session" });
    }
});

// LOGOUT
app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true, message: "Logged out" });
});

// SAVE FRAUD
app.post("/api/fraud", (req, res) => {
    fraudLogs.push(req.body);
    res.json({ message: "Saved" });
});

// GET FRAUD
app.get("/api/fraud", (req, res) => {
    res.json(fraudLogs);
});

// AUDIT LOGS
app.get("/api/audit-logs", (req, res) => {
    res.json({ logs: [] });
});

app.post("/api/audit-logs", (req, res) => {
    res.json({ success: true });
});

app.get("/", (req, res) => {
    res.send("ATM Fraud Backend is Running 🚀");
});

app.listen(3001, () => {
    console.log("🚀 Backend running on http://localhost:3001");
});

