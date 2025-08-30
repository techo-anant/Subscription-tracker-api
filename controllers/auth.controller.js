import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import {JWT_EXPIRES_IN, JWT_SECRET} from "../config/env.js";

export const signUp = async (req, res, next) => {
    // Implementation for Sign Up Logic
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Logic to create a new user
        const {name, email, password} = req.body;

        //Check if user already exists
        const existingUser = await User.findOne({ email});
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create([{name, email, password: hashedPassword}], {session});

        const token = jwt.sign({userID: newUser[0]._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User successfully signed up',
            data: {
                token,
                userID: newUser[0],
            }
        })
    } catch (error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    // Implementation for Sign In Logic
}

export const signOut = async (req, res, next) => {
    // Implementation for Sign Out Logic
}