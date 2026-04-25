require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const Donor = require("./models/Donor");
const Receiver = require("./models/Receiver");

const app = express();
app.use(bodyParser.json());
app.use(cors());

let otpStore = {};

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to send email
async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    return { sent: true };
  } catch (err) {
    console.error("Email failed:", err.message);
    return { sent: false, error: err.message };
  }
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Send Email OTP
app.post("/send-email-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  const mail = await sendEmail(
    email,
    "Food Donation OTP Verification",
    `Your OTP is ${otp}. It is valid for 5 minutes.`
  );

  res.json({
    success: mail.sent,
    message: mail.sent ? "OTP sent" : "Email sending failed"
  });
});

// Verify Email OTP
app.post("/verify-email-otp", (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record) {
    return res.json({ success: false, message: "OTP not found" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.json({ success: false, message: "OTP expired" });
  }

  if (record.otp === otp) {
    delete otpStore[email];
    return res.json({ success: true, message: "OTP verified" });
  }

  res.json({ success: false, message: "Wrong OTP" });
});

// Donor submit
app.post("/donor", async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.json({ success: true, donor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Receiver submit
app.post("/receiver", async (req, res) => {
  try {
    const receiver = new Receiver(req.body);
    await receiver.save();
    res.json({ success: true, receiver });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all donors
app.get("/donors", async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all receivers
app.get("/receivers", async (req, res) => {
  try {
    const receivers = await Receiver.find().sort({ createdAt: -1 });
    res.json(receivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin approve donor + send email
app.post("/admin/approve-donor/:id", async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { returnDocument: "after" }
    );

    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    const mail = await sendEmail(
      donor.email,
      "Food Donation Approved",
      `Hello ${donor.name}, your food donation has been approved. Thank you for your generosity!`
    );

    res.json({
      success: true,
      emailSent: mail.sent,
      message: mail.sent ? "Approved and email sent" : "Approved but email failed"
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin reject donor + send email
app.post("/admin/reject-donor/:id", async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);

    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    const mail = await sendEmail(
      donor.email,
      "Food Donation Update",
      `Hello ${donor.name}, unfortunately your food donation request could not be accepted at this time. Thank you for your effort.`
    );

    res.json({
      success: true,
      emailSent: mail.sent,
      message: mail.sent ? "Rejected and email sent" : "Rejected but email failed"
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin approve receiver + send email
app.post("/admin/approve-receiver/:id", async (req, res) => {
  try {
    const receiver = await Receiver.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { returnDocument: "after" }
    );

    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    const mail = await sendEmail(
      receiver.email,
      "Food Request Approved",
      `Hello ${receiver.name}, your food request has been approved. Someone will contact you shortly.`
    );

    res.json({
      success: true,
      emailSent: mail.sent,
      message: mail.sent ? "Approved and email sent" : "Approved but email failed"
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin delete/reject receiver + send email
app.post("/admin/delete-receiver/:id", async (req, res) => {
  try {
    const receiver = await Receiver.findByIdAndDelete(req.params.id);

    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    const mail = await sendEmail(
      receiver.email,
      "Food Request Update",
      `Hello ${receiver.name}, unfortunately your food request could not be fulfilled at this time.`
    );

    res.json({
      success: true,
      emailSent: mail.sent,
      message: mail.sent ? "Receiver removed and email sent" : "Receiver removed but email failed"
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Food Donation Backend Running");
});

// Start server
app.listen(5000, () => {
  console.log("🚀 Server on port 5000");
});