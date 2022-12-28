import mongoose from "mongoose";

const kycSchema = mongoose.Schema({
  wallet: String,
  isApproved: {
    type: Boolean,
    default: false,
  },
  fname: String,
  lname: String,
  dob: String,
  email: String,
  phone: Number,
  address: String,
  country: String,
  identity: String,
});

export default mongoose.model("Kyc", kycSchema);
