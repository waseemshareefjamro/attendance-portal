const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Get all attendance records
router.get('/', async (req, res) => {
    try {
        const records = await Attendance.find();
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark Attendance
router.post('/', async (req, res) => {
    const { studentId, classId, className, date, status, timestamp } = req.body;
    try {
        const record = new Attendance({
            studentId,
            classId,
            className,
            date,
            status,
            timestamp
        });
        await record.save();
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
