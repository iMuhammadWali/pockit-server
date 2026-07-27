import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: [true, "Wallet name is required."]
    },
    balance: {
        type: Number,
        default: 0
    }
});

// I am not enforcing a min constraint on balance because balance can be negative 
// and it shows debt.