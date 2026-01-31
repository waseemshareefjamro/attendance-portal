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
        // Normalize basic fields first
        const studentId = data.studentId || data.studentid || data.studentID || data['student id'];
        const classId = data.classId || data.classid || data.classID || data['class id'];
        const className = data.className || data.classname || data.class || data.Class;
        const date = data.date || data.Date;
        const timeSlot = data.timeSlot || data.TimeSlot || data.timeslot;
        const status = data.status || data.Status;
        const timestamp = data.timestamp || data.Timestamp || new Date().toISOString();
        const name = data.name || data.Name;
        const id = data.id || data.ID;

        // Return object with multiple key variants to match potential Google Sheet Headers
        // appendRow uses exact key matching against headers
        return {
            ...data,
            // Standard internal keys
            id, studentId, classId, className, date, timeSlot, status, timestamp, name,

            // Header Helper Variants (PascalCase / Spaced)
            "ID": id,
            "Student ID": studentId,
            "StudentID": studentId,
            "studentID": studentId,
            "Name": name,
            "Class ID": classId,
            "ClassID": classId,
            "Class": className,
            "Class Name": className,
            "ClassName": className,
            "Date": date,
            "Time Slot": timeSlot,
            "TimeSlot": timeSlot,
            "Status": status,
            "Timestamp": timestamp
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

    static async insertMany(dataArray) {
        const results = [];
        // Loop through and append. 
        // Note: Google Sheets API has value.append that can take multiple rows at once.
        // Our appendRow helper might only take one, but let's see.
        // The appendRow helper takes `rowData` object.
        // We can optimize this by creating a bulkAppend helper later, but for now, 
        // to ensure reliability, we just loop await.
        for (const data of dataArray) {
            const instance = new AttendanceModel(data);
            const saved = await instance.save();
            results.push(saved);
        }
        return results;
    }
}

module.exports = AttendanceModel;
