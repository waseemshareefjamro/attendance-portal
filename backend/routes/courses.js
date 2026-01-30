const express = require('express');
const router = express.Router();
const Course = require('../models_sheets/Course');
const Enrollment = require('../models_sheets/Enrollment');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Course
router.post('/', async (req, res) => {
    const { id, name, instructorId } = req.body;
    try {
        const newCourse = new Course({ id, name, instructorId });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete Course
router.delete('/:id', async (req, res) => {
    try {
        await Course.findOneAndDelete({ id: req.params.id });
        await Enrollment.deleteMany({ classId: req.params.id });
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Enrollments ---

// Get all enrollments
router.get('/enrollments', async (req, res) => {
    try {
        const enrollments = await Enrollment.find();
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Enroll Student
router.post('/enroll', async (req, res) => {
    const { studentId, classId } = req.body;
    try {
        const exists = await Enrollment.findOne({ studentId, classId });
        if (exists) return res.status(400).json({ message: 'Already enrolled' });

        const enrollment = new Enrollment({ studentId, classId });
        await enrollment.save();
        res.status(201).json(enrollment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Unenroll Student
router.post('/unenroll', async (req, res) => {
    const { studentId, classId } = req.body;
    try {
        await Enrollment.findOneAndDelete({ studentId, classId });
        res.json({ message: 'Unenrolled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
