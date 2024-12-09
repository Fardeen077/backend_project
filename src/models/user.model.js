import mongoose, { Schema } from "mongoose";
// interviwe --> jwt is Bearer token ek type ka access token hota hai jo authentication aur authorization ke liye use hota hai. Yeh token server ko batata hai ki client (jaise ki app ya browser) ke paas specific resource ya action ko access karne ka permission hai. 

// jsonwebtoken (JWT) is a library used for creating and verifying JSON Web Tokens (JWTs), which are compact and self-contained tokens often used for authentication and secure data exchange.

// cheack token in jwt.io
import jwt from "jsonwebtoken";
// Bcrypt is a password-hashing function designed to securely store passwords. 
import bcrypt from "bcryptjs"

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        //index are use for searching field 
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,// cloudinary Url
        required: true,
    },
    coverImage: {
        type: String,// cloudinary Url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "video",
        }
    ],
    password: {
        type: String,
        required: [true, 'password is required']
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

// frehook this is function for password encrypt
userSchema.pre("save", async function (next) {
    // agar pass is modifide so ok but pass is not modifide so you retrue next 
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10); // 10 num is * has round
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    // bcrypt are cheack pass auto and return true and fales
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema);