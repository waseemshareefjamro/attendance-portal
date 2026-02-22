import { databases, DATABASE_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const COLLECTIONS = {
    STUDENTS: 'students',
    INSTRUCTORS: 'instructors',
    COURSES: 'courses',
    ENROLLMENTS: 'enrollments',
    ATTENDANCE: 'attendance'
};

export const appwriteService = {
    // 1. Health check (mocked as Appwrite is always "up" if reachable)
    checkHealth: async () => {
        try {
            // Just try a simple list call to verify connection
            await databases.listDocuments(DATABASE_ID, COLLECTIONS.COURSES, [Query.limit(1)]);
            return { server: 'running', database: 'active' };
        } catch (error) {
            console.error("Appwrite health check failed:", error);
            return { server: 'down', database: 'error' };
        }
    },

    // 2. Students
    getStudents: async () => {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS);
        return response.documents.map(doc => ({
            ...doc,
            StudentID: doc.studentID,
            Name: doc.name,
            Password: doc.password,
            Gender: doc.gender,
            Class: doc.class
        }));
    },
    addStudent: async (student) => {
        const normalized = {
            name: student.Name || student.name,
            studentID: student.StudentID || student.studentID,
            password: student.Password || student.password,
            gender: student.Gender || student.gender,
            class: student.class || student.className || student.Class
        };
        return await databases.createDocument(DATABASE_ID, COLLECTIONS.STUDENTS, ID.unique(), normalized);
    },
    updateStudent: async (documentId, updatedData) => {
        const normalized = {
            name: updatedData.Name || updatedData.name,
            studentID: updatedData.StudentID || updatedData.studentID,
            password: updatedData.Password || updatedData.password,
            gender: updatedData.Gender || updatedData.gender,
            class: updatedData.class || updatedData.className
        };
        return await databases.updateDocument(DATABASE_ID, COLLECTIONS.STUDENTS, documentId, normalized);
    },
    deleteStudent: async (documentId) => {
        return await databases.deleteDocument(DATABASE_ID, COLLECTIONS.STUDENTS, documentId);
    },

    // 3. Instructors
    getInstructors: async () => {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INSTRUCTORS);
        return response.documents.map(doc => ({
            ...doc,
            Name: doc.name,
            Username: doc.username,
            Password: doc.password
        }));
    },
    addInstructor: async (instructor) => {
        return await databases.createDocument(DATABASE_ID, COLLECTIONS.INSTRUCTORS, ID.unique(), instructor);
    },
    updateInstructor: async (documentId, updatedData) => {
        return await databases.updateDocument(DATABASE_ID, COLLECTIONS.INSTRUCTORS, documentId, updatedData);
    },
    deleteInstructor: async (documentId) => {
        return await databases.deleteDocument(DATABASE_ID, COLLECTIONS.INSTRUCTORS, documentId);
    },

    // 4. Courses (Classes)
    getCourses: async () => {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COURSES);
        return response.documents.map(doc => ({
            ...doc,
            name: doc.name,
            id: doc.id,
            instructorId: doc.instructorId
        }));
    },
    addCourse: async (course) => {
        return await databases.createDocument(DATABASE_ID, COLLECTIONS.COURSES, ID.unique(), course);
    },
    updateCourse: async (documentId, updatedData) => {
        return await databases.updateDocument(DATABASE_ID, COLLECTIONS.COURSES, documentId, updatedData);
    },
    deleteCourse: async (documentId) => {
        return await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COURSES, documentId);
    },

    // 5. Enrollments
    getEnrollments: async () => {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ENROLLMENTS);
        return response.documents.map(doc => ({
            ...doc,
            studentId: doc.studentId,
            classId: doc.classId,
            name: doc.name
        }));
    },
    enrollStudent: async (studentId, classId, studentName = '') => {
        // Check if already enrolled
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ENROLLMENTS, [
            Query.equal('studentId', studentId),
            Query.equal('classId', classId)
        ]);
        if (existing.total > 0) throw new Error("Student already enrolled in this class");

        return await databases.createDocument(DATABASE_ID, COLLECTIONS.ENROLLMENTS, ID.unique(), {
            studentId,
            classId,
            name: studentName
        });
    },
    unenrollStudent: async (studentId, classId) => {
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ENROLLMENTS, [
            Query.equal('studentId', studentId),
            Query.equal('classId', classId)
        ]);
        if (existing.total === 0) return true;

        // Delete all matches (should be only one)
        for (const doc of existing.documents) {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ENROLLMENTS, doc.$id);
        }
        return true;
    },

    // 6. Attendance
    getAttendance: async () => {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ATTENDANCE, [
            Query.orderDesc('$createdAt'),
            Query.limit(100)
        ]);
        return response.documents.map(doc => ({
            ...doc,
            studentId: doc.studentId,
            classId: doc.classId,
            className: doc.className,
            date: doc.date,
            timeSlot: doc.timeSlot,
            status: doc.status,
            name: doc.name,
            timestamp: doc.timestamp || doc.$createdAt
        }));
    },
    markAttendance: async (record) => {
        const normalized = {
            studentId: record.studentId || record.StudentID,
            classId: record.classId || record.ClassID,
            className: record.className || record.Class,
            date: record.date,
            timeSlot: record.timeSlot,
            status: record.status,
            name: record.name || record.Name
        };
        return await databases.createDocument(DATABASE_ID, COLLECTIONS.ATTENDANCE, ID.unique(), normalized);
    },
    updateAttendance: async (documentId, updatedData) => {
        const normalized = {
            status: updatedData.status
        };
        // We only really need to update status for attendance
        return await databases.updateDocument(DATABASE_ID, COLLECTIONS.ATTENDANCE, documentId, normalized);
    },
    deleteAttendance: async (documentId) => {
        return await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ATTENDANCE, documentId);
    },

    // 7. Auth Logic (Database-based to match existing no-email setup)
    loginStudent: async (studentId, password) => {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS, [
            Query.equal('studentID', studentId),
            Query.equal('password', password)
        ]);
        if (response.total > 0) {
            const doc = response.documents[0];
            return {
                role: 'student',
                data: {
                    ...doc,
                    StudentID: doc.studentID,
                    Name: doc.name,
                    Password: doc.password,
                    Gender: doc.gender,
                    Class: doc.class
                }
            };
        }
        throw new Error("Invalid credentials");
    },
    loginInstructor: async (username, password) => {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INSTRUCTORS, [
            Query.equal('username', username),
            Query.equal('password', password)
        ]);
        if (response.total > 0) {
            const doc = response.documents[0];
            return {
                role: 'instructor',
                data: {
                    ...doc,
                    Name: doc.name,
                    Username: doc.username,
                    Password: doc.password
                }
            };
        }
        throw new Error("Invalid credentials");
    },
    loginAdmin: async (username, password) => {
        if (username === 'waseemshareef' && password === 'Waseem$123') {
            return { role: 'super_admin', data: { name: 'Super Admin' } };
        }
        throw new Error("Invalid Admin credentials");
    }
};
