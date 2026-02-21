// we use DRY(don't repeat yourself) rules for connection to database.

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("Please define the MONGO_URI in .env");
// we must prevent to connection to database, we need connect to db first time after that not necessary to connect(every request we send, handler function to be executed we need executed just one time).

// we checked db connection below :
// before if the connection was connected (if : condition) is true, but connection wasn't connected is false.

export default async function connectDB() {
  try {
    if (mongoose.connections[0].readyState) return;

    await mongoose.connect(MONGO_URI);

    console.log("Connected to MongoDB Atlas successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}
