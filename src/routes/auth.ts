import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/Users.js";
import mongoose from "mongoose";
import { Profile } from "../models/Profiles.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      await session.abortTransaction();
      return next({ status: 400, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      await session.abortTransaction();
      return next({
        status: 400,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profile = await Profile.create([{ fullName }], { session });

    if (!profile[0]) {
      await session.abortTransaction();
      return next({ status: 500, message: "Failed to create user profile" });
    }

    const user = await User.create(
      [
        {
          email,
          password: hashedPassword,
          profile: profile[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res
      .status(201)
      .json({ message: "User registered successfully", user: user[0] });
  } catch (error) {
    await session.abortTransaction();
    next({ status: 500, message: "Internal server error" });
  } finally {
    session.endSession();
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({ status: 400, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("profile");

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    const isVaild = await bcrypt.compare(password, user.password);

    if (!isVaild) {
      return next({ status: 401, message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    next({ status: 500, message: "Internal server error" });
  }
});

// router.get("/", async (req, res, next) => {
//   try {
//     const profiles = await Profile.find({});

//     res.status(200).json(profiles);
//   } catch (error) {
//     next({ status: 500, message: "Internal server error" });
//   }
// });

export default router;
