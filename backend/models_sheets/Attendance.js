const { getSheetRows, appendRow, deleteMatchingRows, updateMatchingRows } = require('../config/googleSheets');

const TAB_NAME = 'Attendance';

class AttendanceModel {
    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows;
        return rows.filter(row => Object.keys(query).every(key => String(row[key]) === String(query[key])));
    }

    constructor(data) {
        this.data = data;
    }

    async save() {
        // Attendance records usually just appended
        return await appendRow(TAB_NAME, this.data);
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
