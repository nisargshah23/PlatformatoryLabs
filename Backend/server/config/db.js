import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://rigrunner23:1234@cluster0.1xtsq.mongodb.net/user_management";
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB successfully...");
  } catch (error) {
    console.log("Connection Failed", error);
  }
};

export default connectDB;
