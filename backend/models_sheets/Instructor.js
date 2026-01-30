const { getSheetRows, appendRow, updateRow, deleteRow } = require('../config/googleSheets');

const TAB_NAME = 'Instructors';

class InstructorModel {
    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows;
        return rows.filter(row => Object.keys(query).every(key => row[key] == query[key]));
    }

    static async findOne(query) {
        const rows = await this.find(query);
        return rows.length > 0 ? rows[0] : null; // Plain object needed for simple reads
    }

    // For updates: similar to Student
    static async findOneWithUpdate(query) {
        const rows = await this.find(query);
        if (rows.length === 0) return null;
        const data = rows[0];
        const instance = { ...data };
        instance.save = async function () {
            await updateRow(TAB_NAME, 'username', this.username, this);
            return this;
        };
        return instance;
    }

    constructor(data) {
        this.data = data;
    }

    async save() {
        return await appendRow(TAB_NAME, this.data);
    }

    static async create(data) {
        const instance = new InstructorModel(data);
        return await instance.save();
    }

    static async findOneAndDelete(query) {
        if (!query.username) throw new Error("Delete requires username");
        await deleteRow(TAB_NAME, 'username', query.username);
    }
}

// Hook findOne to return updateable object ? 
// The route `routes/instructors.js` uses: const instructor = await Instructor.findOne(...); ... instructor.name = ... await instructor.save();
// So yes, findOne needs to be capable
const actualFindOne = InstructorModel.findOne;
InstructorModel.findOne = async function (query) {
    return await InstructorModel.findOneWithUpdate(query);
};

module.exports = InstructorModel;
