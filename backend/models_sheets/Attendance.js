const { getSheetRows, appendRow, deleteMatchingRows, updateMatchingRows } = require('../config/googleSheets');

const TAB_NAME = 'Attendance';

class AttendanceModel {
    // Normalization Helpers
    static toFrontend(data) {
        if (!data) return null;
        return {
            studentId: data.studentId || data.studentid || data.studentID || data['student id'],
            classId: data.classId || data.classid || data.classID || data['class id'],
            className: data.className || data.classname || data.class || data.Class,
            date: data.date || data.Date,
            status: data.status || data.Status,
            timestamp: data.timestamp || data.Timestamp,
            ...data
        };
    }

    static toBackend(data) {
        return {
            studentId: data.studentId || data.studentid || data.studentID,
            classId: data.classId || data.classid || data.classID,
            className: data.className || data.classname || data.class || data.Class,
            date: data.date || data.Date,
            status: data.status || data.Status,
            timestamp: data.timestamp || data.Timestamp,
            ...data
        };
    }

    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows.map(this.toFrontend);

        const filtered = rows.filter(row => Object.keys(query).every(key => String(row[key]) === String(query[key])));
        return filtered.map(this.toFrontend);
    }

    constructor(data) {
        this.data = AttendanceModel.toBackend(data);
    }

    async save() {
        // Attendance records usually just appended
        const saved = await appendRow(TAB_NAME, this.data);
        return AttendanceModel.toFrontend(saved);
    }

    static async create(data) {
        // Data might need timestamp if not present
        if (!data.timestamp) data.timestamp = new Date().toISOString();
        const instance = new AttendanceModel(data);
        return await instance.save();
    }

    static async deleteMany(query) {
        const filterFn = (row) => {
            return Object.keys(query).every(key => String(row[key]) === String(query[key]));
        };
        await deleteMatchingRows(TAB_NAME, filterFn);
    }

    static async updateMany(filter, updateDoc) {
        const filterFn = (row) => {
            return Object.keys(filter).every(key => String(row[key]) === String(filter[key]));
        };
        await updateMatchingRows(TAB_NAME, filterFn, updateDoc);
    }
}

module.exports = AttendanceModel;
