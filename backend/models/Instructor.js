const mongoose = require('mongoose');

const instructorSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Instructor', instructorSchema);
