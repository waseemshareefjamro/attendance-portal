const mongoose = require('mongoose');

const enrollmentSchema = mongoose.Schema({
    studentId: { type: String, required: true, ref: 'Student' },
    classId: { type: String, required: true, ref: 'Course' }
    // Composite key could be enforced here if needed
}, {
    timestamps: true
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
