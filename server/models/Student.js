const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    studentID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, default: 'Male' },
    // Legacy support or extra details
    class: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
