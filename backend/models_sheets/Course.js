const { getSheetRows, appendRow, updateRow, deleteRow } = require('../config/googleSheets');

const TAB_NAME = 'Courses';

class CourseModel {
    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows;
        return rows.filter(row => Object.keys(query).every(key => row[key] == query[key]));
    }

    constructor(data) {
        this.data = data;
    }

    async save() {
        return await appendRow(TAB_NAME, this.data);
    }

    static async create(data) {
        const instance = new CourseModel(data);
        return await instance.save();
    }

    static async deleteOne(query) {
        // usually { id: ... } per schema
        if (query.id) {
            await deleteRow(TAB_NAME, 'id', query.id);
        }
    }
}

module.exports = CourseModel;
