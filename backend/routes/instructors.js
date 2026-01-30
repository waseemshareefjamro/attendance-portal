const express = require('express');
const router = express.Router();
const Instructor = require('../models_sheets/Instructor');

// Get all instructors
router.get('/', async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Instructor
router.post('/', async (req, res) => {
    const { username, password, name } = req.body;
    try {
        const newInstructor = new Instructor({ username, password, name });
        await newInstructor.save();
        res.status(201).json(newInstructor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update Instructor
router.put('/:username', async (req, res) => {
    const { username } = req.params;
    const { newUsername, password, name } = req.body;

    try {
        const instructor = await Instructor.findOne({ username });
        if (!instructor) return res.status(404).json({ message: 'Instructor not found' });

        instructor.password = password || instructor.password;
        instructor.name = name || instructor.name;

        if (newUsername && newUsername !== username) {
            const exists = await Instructor.findOne({ username: newUsername });
            if (exists) return res.status(400).json({ message: 'Username taken' });
            instructor.username = newUsername;
        }

        const updated = await instructor.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete Instructor
router.delete('/:username', async (req, res) => {
    try {
        await Instructor.findOneAndDelete({ username: req.params.username });
        res.json({ message: 'Instructor deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
