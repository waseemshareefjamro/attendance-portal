const { getSheetRows, appendRow, deleteMatchingRows, updateMatchingRows } = require('../config/googleSheets');

const TAB_NAME = 'Enrollments';

class EnrollmentModel {
    // Transform internal to Frontend (camelCase)
    static toFrontend(data) {
        if (!data) return null;
        return {
            studentId: data.studentId || data.studentid || data.studentID || data.StudentID,
            classId: data.classId || data.classid || data.classID || data.ClassID,
            ...data
        };
    }

    // Transform Frontend to internal (lowercase)
    static toBackend(data) {
        return {
            studentId: data.studentId || data.studentid || data.studentID,
            classId: data.classId || data.classid || data.classID,
            ...data
        };
    }

    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows.map(this.toFrontend);

        const filtered = rows.filter(row => {
            // Compare using string conversion for safety
            return Object.keys(query).every(key => String(row[key]) === String(query[key]));
        });
        return filtered.map(this.toFrontend);
    }

    static async findOne(query) {
        const rows = await this.find(query);
        return rows.length > 0 ? rows[0] : null;
    }

    constructor(data) {
        this.data = EnrollmentModel.toBackend(data);
    }

    async save() {
        const saved = await appendRow(TAB_NAME, this.data);
        return EnrollmentModel.toFrontend(saved);
    }

    // static create for convenience
    static async create(data) {
        const instance = new EnrollmentModel(data);
        return await instance.save();
    }

    static async deleteMany(query) {
        // e.g. { studentId: '...' } or { classId: '...' }
        const filterFn = (row) => {
            return Object.keys(query).every(key => String(row[key]) === String(query[key]));
        };
        await deleteMatchingRows(TAB_NAME, filterFn);
    }

    static async findOneAndDelete(query) {
        // Required for unenroll route
        // query: { studentId, classId }
        const filterFn = (row) => {
            return Object.keys(query).every(key => String(row[key]) === String(query[key]));
        };
        // We can reuse deleteMatchingRows but it deletes ALL matches. 
        // For unique student+class, it should be fine.
        await deleteMatchingRows(TAB_NAME, filterFn);
        return true;
    }

    static async updateMany(filter, updateDoc) {
        // e.g. filter { studentId: 'old' }, update { studentId: 'new' }
        const filterFn = (row) => {
            return Object.keys(filter).every(key => String(row[key]) === String(filter[key]));
        };
        await updateMatchingRows(TAB_NAME, filterFn, updateDoc);
    }
}

module.exports = EnrollmentModel;
