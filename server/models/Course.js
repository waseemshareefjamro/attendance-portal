const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Normalized Course ID (e.g. 'CS101')
    name: { type: String, required: true },
    instructorId: { type: String } // Links to Instructor username
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
