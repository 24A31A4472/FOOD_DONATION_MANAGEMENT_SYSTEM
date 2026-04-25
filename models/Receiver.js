const mongoose = require("mongoose");

const receiverSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email: {
    type: String,
    required: true
  },
  needDetails: { type: String, required: true },
  status:      { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Receiver", receiverSchema);
