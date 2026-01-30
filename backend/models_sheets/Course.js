const { getSheetRows, appendRow, updateRow, deleteRow } = require('../config/googleSheets');

const TAB_NAME = 'Courses';

class CourseModel {
    // Normalization
    static toFrontend(data) {
        if (!data) return null;
        return {
            id: data.id || data.Id || data.ID, // Course Code
            name: data.name || data.Name,
            instructorId: data.instructorId || data.InstructorId || data.instructorID,
            ...data
        };
    }

    static toBackend(data) {
        return {
            id: data.id || data.Id || data.ID,
            name: data.name || data.Name,
            instructorId: data.instructorId || data.InstructorId || data.instructorID,
            ...data
        };
    }

    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows.map(this.toFrontend);

        const filtered = rows.filter(row => Object.keys(query).every(key => row[key] == query[key]));
        return filtered.map(this.toFrontend);
    }

    constructor(data) {
        this.data = CourseModel.toBackend(data);
    }

    async save() {
        const saved = await appendRow(TAB_NAME, this.data);
        return CourseModel.toFrontend(saved);
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
