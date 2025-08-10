import express from "express";
import { PORT } from "./index.js";

const app = express();

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on portt ${PORT}`);
});
