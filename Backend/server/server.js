import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute.js";
import cors from "cors";

const app = express();

dotenv.config();
const PORT = process.env.PORT;
app.use(express.json());

app.use(cors());
app.use("/users", userRouter);

app.listen(3000, async () => {
  await connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
