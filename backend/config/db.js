const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_db';

        // Add event listeners for better debugging
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connection established successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB connection disconnected');
        });

        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Only exit process in development, or let it retry/fail gracefully in production
        if (process.env.NODE_ENV === 'development') {
            // process.exit(1); 
        }
    }
};

module.exports = connectDB;
