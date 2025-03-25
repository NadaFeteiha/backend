import mongoose from "mongoose";

/**
    Topic is a collection of resources to learn a specific skill.
    for example, if you want to learn javascript, you need to learn
    variables, data types, functions, etc.
*/
const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ["language", "framework", "tool", "concept", "platform"],
        default: "language"
    },
    resources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource"
    }]
}, {
    timestamps: true
});

export const Topic = mongoose.model("Topic", topicSchema);