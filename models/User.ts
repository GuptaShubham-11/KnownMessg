import mongoose, { Schema, Document } from "mongoose";

// Define the IMessage interface & schema
export interface IMessage extends Document {
    content: string;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
});


// Define the IUser interface & schema
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiray: string;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    message: IMessage[];
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    verifyCode: {
        type: String,
        required: true
    },
    verifyCodeExpiray: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessage: {
        type: Boolean,
        required: true,
        default: false
    },
    message: [messageSchema],
});

const User = mongoose.models.User as mongoose.Model<IUser> || mongoose.model<IUser>("User", userSchema);

export default User;