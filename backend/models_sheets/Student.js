const { getSheetRows, appendRow, updateRow, deleteRow } = require('../config/googleSheets');

const TAB_NAME = 'Students';

class StudentModel {
    // Find all matching a query
    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows;

        // Simple filtering
        return rows.filter(row => {
            return Object.keys(query).every(key => row[key] == query[key]);
        });
    }

    // Find one
    static async findOne(query) {
        const rows = await this.find(query);
        return rows.length > 0 ? rows[0] : null;
    }

    // Constructor to mimic Mongoose instance
    constructor(data) {
        this.data = data;
    }

    // Save (Create)
    async save() {
        // Check for uniqueness if needed, but for now just append
        const saved = await appendRow(TAB_NAME, this.data);
        return saved;
    }

    // Static create
    static async create(data) {
        const instance = new StudentModel(data);
        return await instance.save();
    }

    // Insert Many
    static async insertMany(dataArray, options) {
        const results = [];
        for (const data of dataArray) {
            const saved = await appendRow(TAB_NAME, data);
            results.push(saved);
        }
        return results;
    }

    // Find by ID and Update purely for Mongoose compatibility
    // Our 'id' in routes is often the studentID string, NOT the mongo _id
    static async findOneAndDelete(query) {
        // Query usually { studentID: '...' }
        if (!query.studentID) throw new Error("Delete requires studentID");
        await deleteRow(TAB_NAME, 'studentID', query.studentID);
        return true;
    }

    // Custom method to mimic findOne -> save pattern
    // In our route: const student = await findOne... student.name = ... student.save()
    // We need to return an object that HAS a save() method that UPDATES.

    static async findOneWithUpdateCapability(query) {
        const data = await this.findOne(query);
        if (!data) return null;

        // Return object decorated with save method
        const studentObj = { ...data };
        studentObj.save = async function () {
            // We assume studentID is the key
            await updateRow(TAB_NAME, 'studentID', this.studentID, this);
            return this;
        };
        return studentObj;
    }
}

// Intercept specific calls to match Mongoose API exactly where possible
// But standard findOne returns plain JSON in our simple implementation above.
// The Route uses: const student = await Student.findOne(...); if (student) ...
// The Route Update uses: student.save().
// So findOne MUST return an object with .save() if we want to minimize route changes.

const actualFindOne = StudentModel.findOne;
StudentModel.findOne = async function (query) {
    return await StudentModel.findOneWithUpdateCapability(query);
};

module.exports = StudentModel;
