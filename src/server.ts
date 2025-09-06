import express from 'express';
import cors from 'cors';
import { connectDB } from './index.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import Config from './config.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const app = express();

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

app.use(errorHandler);

app.listen(Config.SERVER_PORT, () => {
  console.log(`Server is running on port ${Config.SERVER_PORT}`);
});
