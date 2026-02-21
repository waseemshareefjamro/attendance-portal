import React, { createContext, useContext, useState, useEffect } from 'react';
import { appwriteService as api } from '../services/appwriteService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // State
    const [students, setStudents] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [classes, setClasses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [serverStatus, setServerStatus] = useState(null);

    // Initial Data Fetch
    const checkServerHealth = async () => {
        try {
            const status = await api.checkHealth();
            setServerStatus(status);
            return status.server === 'running';
        } catch (error) {
            setServerStatus({ server: 'down', database: 'error' });
            return false;
        }
    };

    const fetchData = async () => {
        setLoading(true);
        const isHealthy = await checkServerHealth();

        if (!isHealthy) {
            setLoading(false);
            return;
        }

        try {
            const [studentsData, enrollmentsData, attendanceData, classesData, instructorsData] = await Promise.all([
                api.getStudents(),
                api.getEnrollments(),
                api.getAttendance(),
                api.getCourses(),
                api.getInstructors()
            ]);

            setStudents(studentsData);
            setEnrollments(enrollmentsData);
            setAttendance(attendanceData);
            setClasses(classesData);
            setInstructors(instructorsData);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll health every 30 seconds
        const interval = setInterval(checkServerHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    // --- Actions ---

    // 1. Registry Management (Super Admin)
    const addStudent = async (student) => {
        try {
            await api.addStudent(student);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const addStudentsBulk = async (newStudents) => {
        try {
            // Appwrite doesn't have a native bulk create document in one call
            // We'll loop for now to match behavior, but we could optimize later
            for (const student of newStudents) {
                await api.addStudent(student);
            }
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const updateStudent = async (docId, updatedData) => {
        try {
            await api.updateStudent(docId, updatedData);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const removeStudentRaw = async (docId) => {
        try {
            await api.deleteStudent(docId);
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    // 2. Enrollment Management (Instructors)
    const enrollStudent = async (studentId, classId, studentName) => {
        try {
            await api.enrollStudent(studentId, classId, studentName);
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const unenrollStudent = async (studentId, classId) => {
        try {
            await api.unenrollStudent(studentId, classId);
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    // 3. Helpers (Synchronous filters on current state)
    const getStudentsByClass = (classId) => {
        const targetClassId = String(classId).toLowerCase();
        const enrolledIds = enrollments
            .filter(e => String(e.classId).toLowerCase() === targetClassId)
            .map(e => String(e.studentId).toLowerCase());

        return students.filter(s => enrolledIds.includes(String(s.studentID || s.StudentID).toLowerCase()));
    };

    const getClassesByStudent = (studentId) => {
        const targetStudentId = String(studentId).toLowerCase();
        return enrollments
            .filter(e => String(e.studentId).toLowerCase() === targetStudentId)
            .map(e => e.classId);
    };

    // 4. Other Actions
    const markAttendance = async (record) => {
        try {
            await api.markAttendance(record);
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const markAttendanceBulk = async (records) => {
        try {
            for (const record of records) {
                await api.markAttendance(record);
            }
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            alert("Failed to save some records: " + error.message);
            return false;
        }
    };

    const updateAttendanceBulk = async (records) => {
        try {
            for (const record of records) {
                // If record has an $id, update it, otherwise create it
                if (record.$id) {
                    await api.updateAttendance(record.$id, record);
                } else {
                    await api.markAttendance(record);
                }
            }
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            alert("Failed to update some records: " + error.message);
            return false;
        }
    };

    // Course Management (Super Admin)
    const addCourse = async (course) => {
        try {
            await api.addCourse(course);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const updateCourse = async (docId, newData) => {
        try {
            await api.updateCourse(docId, newData);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const removeCourse = async (docId) => {
        try {
            await api.deleteCourse(docId);
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const addClass = (className) => {
        addCourse({ id: className, name: className, instructorId: '' });
    };

    // Instructor Management
    const addInstructor = async (username, password, name) => {
        try {
            await api.addInstructor({ username, password, name });
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const updateInstructor = async (docId, newData) => {
        try {
            await api.updateInstructor(docId, newData);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const removeInstructor = async (docId) => {
        try {
            await api.deleteInstructor(docId);
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    // Credential Helpers
    const generateCredential = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };

    const generateStudentId = () => {
        return `STU${Math.floor(1000 + Math.random() * 9000)}`;
    };

    // Login Logic
    const loginStudent = async (studentId, password) => {
        try {
            const response = await api.loginStudent(studentId, password);
            setCurrentUser(response);
            return true;
        } catch (error) {
            return false;
        }
    };

    const loginInstructor = async (username, password) => {
        try {
            const response = await api.loginInstructor(username, password);
            setCurrentUser(response);
            return true;
        } catch (error) {
            return false;
        }
    };

    const loginSuperAdmin = async (username, password) => {
        try {
            const response = await api.loginAdmin(username, password);
            setCurrentUser(response);
            return true;
        } catch (error) {
            return false;
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <AppContext.Provider value={{
            students, enrollments, attendance, classes, instructors, currentUser, loading, serverStatus,
            addStudent, addStudentsBulk, updateStudent, removeStudentRaw,
            enrollStudent, unenrollStudent, getStudentsByClass, getClassesByStudent,
            markAttendance, markAttendanceBulk, updateAttendanceBulk, addClass, addCourse, updateCourse, removeCourse, addInstructor, updateInstructor, removeInstructor,
            loginStudent, loginInstructor, loginSuperAdmin, logout,
            generateCredential, generateStudentId
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

