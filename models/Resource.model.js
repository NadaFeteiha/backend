import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: true,
    },
    type: {
        type: String,
        enum: ["article", "video", "course", "documentation", "tutorial", "book"],
        default: "article"
    },
    language: {
        type: String,
        default: "en",
        enum: ["en", "es", "fr", "ar"],
    },
    difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    }
});

export const Resource = mongoose.model("Resource", resourceSchema);