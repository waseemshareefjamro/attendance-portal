const express = require('express');
const router = express.Router();
const Student = require('../models_sheets/Student');
const Instructor = require('../models_sheets/Instructor');

// Student Login
router.post('/login/student', async (req, res) => {
    const { studentId, password } = req.body;
    try {
        const student = await Student.findOne({ studentID: studentId });
        if (student && student.password === password) {
            // In production, use JWT here
            res.json({ role: 'student', data: student });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Instructor Login
router.post('/login/instructor', async (req, res) => {
    const { username, password } = req.body;
    try {
        const instructor = await Instructor.findOne({ username, password });
        if (instructor) {
            res.json({ role: 'instructor', data: instructor });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Super Admin Login (Environment or Hardcoded for now, as per plan)
router.post('/login/admin', (req, res) => {
    const { username, password } = req.body;
    if (username === 'waseemshareef' && password === 'Waseem$123') {
        res.json({ role: 'super_admin', data: { name: 'Super Admin' } });
    } else {
        res.status(401).json({ message: 'Invalid Admin credentials' });
    }
});

module.exports = router;
