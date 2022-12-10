import mongoose from "mongoose";

const roleSchema = mongoose.Schema({
  roleName: {
    type: String,
  },
  royalty: {
    type: Number,
    default: 0,
  },
  royaltyAddress: {
    type: String,
  },
});

export default mongoose.model("Role", roleSchema);
