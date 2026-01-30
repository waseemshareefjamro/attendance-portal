const express = require('express');
const router = express.Router();
const Student = require('../models_sheets/Student');
const Enrollment = require('../models_sheets/Enrollment');
const Attendance = require('../models_sheets/Attendance');

// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Student
router.post('/', async (req, res) => {
    const { Name, StudentID, Password, Gender, Class } = req.body;
    try {
        const newStudent = new Student({
            name: Name,
            studentID: StudentID,
            password: Password,
            gender: Gender,
            class: Class
        });
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Bulk Add
router.post('/bulk', async (req, res) => {
    const students = req.body; // Array of { Name, StudentID, Password, Gender }
    try {
        // Map to Schema fields
        const formatted = students.map(s => ({
            name: s.Name,
            studentID: s.StudentID,
            password: s.Password,
            gender: s.Gender
        }));

        // Use insertMany with ordered: false to continue on duplicates if needed, or check first
        // Simple approach:
        const result = await Student.insertMany(formatted, { ordered: false });
        res.status(201).json(result);
    } catch (error) {
        // Partial success is possible with ordered: false, but simple error here
        res.status(400).json({ message: error.message });
    }
});

// Update Student
router.put('/:id', async (req, res) => {
    const { id } = req.params; // Old StudentID
    const { Name, StudentID, Password, Gender } = req.body; // New Data

    try {
        const student = await Student.findOne({ studentID: id });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        student.name = Name || student.name;
        student.password = Password || student.password;
        student.gender = Gender || student.gender;

        // If ID changes, we need to handle cascades manually or rely on separate logic
        // For simplicity, updating ID here:
        if (StudentID && StudentID !== id) {
            // Check collision
            const exists = await Student.findOne({ studentID: StudentID });
            if (exists) return res.status(400).json({ message: 'New ID already exists' });
            student.studentID = StudentID;

            // Cascade Update (Enrollments & Attendance)
            await Enrollment.updateMany({ studentId: id }, { studentId: StudentID });
            await Attendance.updateMany({ studentId: id }, { studentId: StudentID });
        }

        const updated = await student.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete Student
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Student.findOneAndDelete({ studentID: id });
        // Cascade Delete
        await Enrollment.deleteMany({ studentId: id });
        await Attendance.deleteMany({ studentId: id });
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
