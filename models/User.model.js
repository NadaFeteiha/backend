import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: "https://gratisography.com/wp-content/uploads/2025/01/gratisography-dog-vacation-800x525.jpg"
    },
    role: {
        type: String,
        enum: ["user", "admin", "mentor"],
        default: "user"
    },
    roadmaps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap"
    }],
    progress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Progress"
    }]
}, {
    timestamps: true,
});

export const User = mongoose.model('User', userSchema);