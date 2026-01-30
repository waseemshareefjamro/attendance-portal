const { getSheetRows, appendRow, updateRow, deleteRow } = require('../config/googleSheets');

const TAB_NAME = 'Instructors';

class InstructorModel {
    // Normalization Helpers
    static toFrontend(data) {
        if (!data) return null;
        return {
            Username: data.username || data.Username,
            Password: data.password || data.Password,
            Name: data.name || data.Name,
            ...data
        };
    }

    static toBackend(data) {
        return {
            username: data.Username || data.username,
            password: data.Password || data.password,
            name: data.Name || data.name,
            ...data
        };
    }

    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) return rows.map(this.toFrontend);

        const filtered = rows.filter(row => Object.keys(query).every(key => row[key] == query[key]));
        return filtered.map(this.toFrontend);
    }

    // For updates: similar to Student
    static async findOneWithUpdate(query) {
        const rows = await this.find(query); // returns Frontend format
        if (rows.length === 0) return null;
        const data = rows[0];

        // Return object capable of saving itself
        const instance = { ...data };
        instance.save = async function () {
            const backendData = InstructorModel.toBackend(this);
            await updateRow(TAB_NAME, 'username', backendData.username, backendData);
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
