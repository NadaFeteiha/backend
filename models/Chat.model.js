import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "New Chat",
    },
    messages: [
        {
            role: {
                type: String,
                required: true,
                enum: ["user", "assistant"]
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});


export default mongoose.model("Chat", chatSchema);