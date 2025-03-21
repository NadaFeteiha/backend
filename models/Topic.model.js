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
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },

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

export const Topic = mongoose.model("Topic", topicSchema);