const { getSheetRows, appendRow, updateRow, deleteRow } = require('../config/googleSheets');

const TAB_NAME = 'Students';

class StudentModel {
    // Find all matching a query
    static async find(query = {}) {
        const rows = await getSheetRows(TAB_NAME);
        if (Object.keys(query).length === 0) {
            return rows.map(this.toFrontend); // Transform for frontend
        }

        // Simple filtering
        const filtered = rows.filter(row => {
            return Object.keys(query).every(key => row[key] == query[key]);
        });
        return filtered.map(this.toFrontend);
    }

    // Transform internal (lowercase) to Frontend (Capitalized)
    static toFrontend(data) {
        if (!data) return null;
        return {
            Name: data.name || data['student name'] || data['studentname'] || data.Name,
            StudentID: data.studentID || data.studentid || data['student id'] || data['studentid'],
            Password: data.password || data.Password,
            password: data.password || data.Password,
            Gender: data.gender || data.Gender,
            class: data.class || data.Class || data.className || data['class name'],
            ...data
        };
    }

    // ... (toBackend is fine)

    // ...

    static async findOneWithUpdateCapability(query) {
        // Fix Recursion: Call find() instead of findOne()
        const rows = await this.find(query);
        const data = rows.length > 0 ? rows[0] : null;

        if (!data) return null;

        // Return object decorated with save method
        const studentObj = { ...data };
        studentObj.save = async function () {
            // Convert back to backend format for storage
            const backendData = StudentModel.toBackend(this);
            // We assume studentID is the key
            await updateRow(TAB_NAME, 'studentID', backendData.studentID, backendData);
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
