import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    city: String,
    pincode: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    provider: { type: String, default: 'email' },
    photoURL: String
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);

export default userModel;
