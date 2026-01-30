const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const connectDB = require('./config/db'); // Removed for Sheets migration
// const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost and Vercel deployments
        if (origin.includes('localhost') || origin.includes('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Connection
// connectDB(); // Removed

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/instructors', require('./routes/instructors'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/attendance', require('./routes/attendance'));

// Root Route for health check
app.get('/', (req, res) => {
    res.send('Attendance System API is running (Google Sheets Backend)');
});

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({
        server: 'running',
        database: 'active'
    });
});

// Detailed Debug Route (User requested this to find exact error)
app.get('/api/debug-connection', async (req, res) => {
    const debugInfo = {
        env: {
            SPREADSHEET_ID_EXISTS: !!process.env.SPREADSHEET_ID,
            GOOGLE_CREDENTIALS_EXISTS: !!process.env.GOOGLE_CREDENTIALS,
            // Don't show full potential secrets, just length or partial
            CREDENTIALS_LENGTH: process.env.GOOGLE_CREDENTIALS ? process.env.GOOGLE_CREDENTIALS.length : 0
        },
        connection: 'pending',
        error: null
    };

    try {
        const { getSheetRows } = require('./config/googleSheets');
        // Try to fetch one row from 'Students'
        const rows = await getSheetRows('Students');
        debugInfo.connection = 'success';
        debugInfo.rowsFound = rows.length;
        res.json(debugInfo);
    } catch (err) {
        debugInfo.connection = 'failed';
        debugInfo.error = err.message;
        debugInfo.stack = err.stack;
        res.status(500).json(debugInfo);
    }
});

// Start Server (Only for local development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
