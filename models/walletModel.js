import mongoose from "mongoose"

const walletSchema = mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

export default mongoose.model("Wallet", walletSchema)
