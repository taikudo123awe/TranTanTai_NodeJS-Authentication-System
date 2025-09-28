import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DB_CONNECTION_STRING;

if (!url) {
    throw new Error("❌ Missing DB_CONNECTION_STRING in .env file");
}

// Function to connect to MongoDB using Mongoose
export const connectUsingMongoose = async() => {
    try {
        await mongoose.connect(url);
        console.log("✅ Mongodb connected using mongoose");
    } catch (err) {
        console.error("❌ Error while connecting to db");
        console.error(err.message);
    }
};