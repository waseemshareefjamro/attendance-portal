const express = require('express');
const router = express.Router();
const Attendance = require('../models_sheets/Attendance');

// Get all attendance records
router.get('/', async (req, res) => {
    try {
        const records = await Attendance.find();
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark Attendance (Single)
router.post('/', async (req, res) => {
    const { studentId, classId, className, date, status, timestamp } = req.body;
    try {
        const record = await Attendance.create({
            studentId,
            classId,
            className,
            date,
            status,
            timestamp
        });
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Bulk Attendance
router.post('/bulk', async (req, res) => {
    const records = req.body; // Array of records
    if (!Array.isArray(records)) {
        return res.status(400).json({ message: "Expected array of records" });
    }
    try {
        const results = await Attendance.insertMany(records);
        res.status(201).json(results);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
