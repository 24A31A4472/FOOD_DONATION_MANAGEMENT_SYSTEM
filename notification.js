require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const twilio = require("twilio");
const Donor = require("./models/Donor");
const Receiver = require("./models/Receiver");

// ---------------- Initialize Express app ----------------
const app = express();
app.use(bodyParser.json());
app.use(cors());

// ---------------- Twilio client ----------------
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// ---------------- MongoDB connection ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


// ---------------- Donor & Receiver routes ----------------
app.post("/donor", async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.json({ success: true, donor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/receiver", async (req, res) => {
  try {
    const receiver = new Receiver(req.body);
    await receiver.save();
    res.json({ success: true, receiver });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/donors", async (req, res) => {
  const donors = await Donor.find();
  res.json(donors);
});

app.get("/receivers", async (req, res) => {
  const receivers = await Receiver.find();
  res.json(receivers);
});

// ---------------- OTP routes ----------------
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const message = await client.messages.create({
      body: `Your verification OTP is ${otp}`,
      from: twilioNumber,
      to: phone
    });
    console.log("✅ Twilio message SID:", message.sid);

    await Otp.deleteMany({ phone });
    const newOtp = new Otp({ phone, otp });
    await newOtp.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { phone, code } = req.body;
  try {
    const record = await Otp.findOne({ phone });
    if (!record) return res.json({ status: "expired", message: "OTP expired or not found" });

    if (record.otp === code) {
      await Otp.deleteMany({ phone });
      res.json({ status: "approved", message: "OTP verified successfully" });
    } else {
      res.json({ status: "denied", message: "Wrong OTP entered" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// ---------------- Test route ----------------
app.get("/", (req, res) => {
  res.send("Backend running with OTP + MongoDB + Twilio 🚀");
});

// ---------------- Start server ----------------

app.listen(5000, () => console.log("🚀 Server started on port 5000"));