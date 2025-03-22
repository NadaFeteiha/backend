import mongoose from "mongoose";

/**
    Roadmap is a collection of topics to achieve a goal.
    for example, if you want to become a back-end developer,
    you need to learn  javascript, node.js, express.js, mongodb, etc.
*/
const roadmapSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: "",
    },
    category: {
        type: String,
        default: "",
    },
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);