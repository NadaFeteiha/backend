import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    roadmap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap",
        required: true
    },
    order: {
        type: Number,
        required: true,
        min: 1
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: true
    }
});

export const Step = mongoose.model("Step", stepSchema);