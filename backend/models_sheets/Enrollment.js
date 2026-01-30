const { getSheetRows, appendRow, deleteMatchingRows, updateMatchingRows } = require('../config/googleSheets');

const TAB_NAME = 'Enrollments';

class EnrollmentModel {
    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows;
        return rows.filter(row => Object.keys(query).every(key => String(row[key]) === String(query[key])));
    }

    static async findOne(query) {
        const rows = await this.find(query);
        return rows.length > 0 ? rows[0] : null;
    }

    constructor(data) {
        this.data = data;
    }

    async save() {
        return await appendRow(TAB_NAME, this.data);
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

    static async updateMany(filter, updateDoc) {
        // e.g. filter { studentId: 'old' }, update { studentId: 'new' }
        const filterFn = (row) => {
            return Object.keys(filter).every(key => String(row[key]) === String(filter[key]));
        };
        await updateMatchingRows(TAB_NAME, filterFn, updateDoc);
    }
}

module.exports = EnrollmentModel;
