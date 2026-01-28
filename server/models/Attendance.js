const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    studentId: { type: String, required: true },
    classId: { type: String }, // Optional for legacy support
    className: { type: String }, // Legacy support
    date: { type: String, required: true },
    timeSlot: { type: String }, // e.g. "09:00 AM - 10:00 AM"
    status: { type: String, enum: ['Present', 'Absent'], required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);
