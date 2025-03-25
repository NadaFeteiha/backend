import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    roadmap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap",
        required: true
    },
    currentStep: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Step"
    },
    completedSteps: [{
        step: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Step"
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        completionPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    }],
    completedTopics: [{
        topic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topic"
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        resourcesCompleted: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource"
        }]
    }],
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date
    },
});

export const Progress = mongoose.model("Progress", progressSchema);
