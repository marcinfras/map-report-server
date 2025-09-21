import express from 'express';
import cors from 'cors';
import { connectDB } from './index.js';
import authRouter from './routes/auth/auth.routes.js';
import pinsRouter from './routes/pins/pins.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import Config from './config.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import fs from 'fs';

const app = express();

const uploadsDir = path.join(process.cwd(), 'uploads/pins');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(express.json());
connectDB();

app.use(
  cors({
    origin: Config.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: Config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: Config.MONGODB_URI,
    }),
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

app.use('/auth', authRouter);
app.use('/pins', pinsRouter);

app.use(errorHandler);

app.listen(Config.SERVER_PORT, () => {
  console.log(`Server is running on port ${Config.SERVER_PORT}`);
});
