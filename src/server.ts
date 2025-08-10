import express from "express";
import cors from "cors";
import { PORT, connectDB } from "./index.js";
import authRouter from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
connectDB();

app.use(cors());

app.use("/auth", authRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
