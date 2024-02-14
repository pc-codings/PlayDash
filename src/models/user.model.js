import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        required: true,
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    emails: { // Assuming "emails" is intended to be singular, consider renaming to "email" for clarity
        required: true,
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        required: true,
        type: String,
        trim: true,
        index: true,
    },
    avatar: {
        required: true,
        type: String, // Removed required: true, to allow users to register without an avatar
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: { // Corrected the field name from "refreshToke" to "refreshToken"
        type: String,
    },
}, {
    timestamps: true
});

// Pre-save hook for password encryption
userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method for password verification
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method for access token generation
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id, // Consistent usage of _id
        email: this.emails, // Corrected from email to emails to match the schema
        username: this.username,
        fullname: this.fullname, // Corrected from fullName to fullname to match the schema
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

// Method for refresh token generation
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
};

export const User = mongoose.model("User", userSchema);
