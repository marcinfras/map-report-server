import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.SERVER_PORT || 3000;
