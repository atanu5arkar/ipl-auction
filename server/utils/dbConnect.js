import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect('mongodb+srv://atanusarkar1:Bootcamp@cs23.2jvvw4x.mongodb.net/ipl2');
        console.log('Connected to Mongo.');
    } catch (error) {
        console.log('Unable to connect Mongo.');
    }
}

connectDB();