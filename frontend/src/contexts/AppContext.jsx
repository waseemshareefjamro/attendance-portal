import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
            const status = await api.get('/api/health');
            setServerStatus(status);
            return true;
        } catch (error) {
            setServerStatus({ server: 'down', database: 'unknown' });
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
                api.get('/api/students'),
                api.get('/api/courses/enrollments'),
                api.get('/api/attendance'),
                api.get('/api/courses'),
                api.get('/api/instructors')
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
            await api.post('/api/students', student);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const addStudentsBulk = async (newStudents) => {
        try {
            await api.post('/api/students/bulk', newStudents);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const updateStudent = async (oldId, updatedData) => {
        try {
            await api.put(`/api/students/${oldId}`, updatedData);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const removeStudentRaw = async (id) => {
        try {
            await api.delete(`/api/students/${id}`);
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    // 2. Enrollment Management (Instructors)
    const enrollStudent = async (studentId, classId) => {
        try {
            await api.post('/api/courses/enroll', { studentId, classId });
            await fetchData();
            return true;
        } catch (error) {
            console.error(error); // Likely "Already enrolled"
            return false;
        }
    };

    const unenrollStudent = async (studentId, classId) => {
        try {
            await api.post('/api/courses/unenroll', { studentId, classId });
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

        return students.filter(s => enrolledIds.includes(String(s.StudentID || s.studentID).toLowerCase()));
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
            await api.post('/api/attendance', record);
            await fetchData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    // Course Management (Super Admin)
    const addCourse = async (course) => {
        try {
            await api.post('/api/courses', course);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const removeCourse = async (courseId) => {
        try {
            await api.delete(`/api/courses/${courseId}`);
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
            await api.post('/api/instructors', { username, password, name });
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const updateInstructor = async (oldUsername, newData) => {
        try {
            await api.put(`/api/instructors/${oldUsername}`, newData);
            await fetchData();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    };

    const removeInstructor = async (username) => {
        try {
            await api.delete(`/api/instructors/${username}`);
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
            const response = await api.post('/api/auth/login/student', { studentId, password });
            setCurrentUser(response);
            return true;
        } catch (error) {
            return false;
        }
    };

    const loginInstructor = async (username, password) => {
        try {
            const response = await api.post('/api/auth/login/instructor', { username, password });
            setCurrentUser(response);
            return true;
        } catch (error) {
            return false;
        }
    };

    const loginSuperAdmin = async (username, password) => {
        try {
            const response = await api.post('/api/auth/login/admin', { username, password });
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
            markAttendance, addClass, addCourse, removeCourse, addInstructor, updateInstructor, removeInstructor,
            loginStudent, loginInstructor, loginSuperAdmin, logout,
            generateCredential, generateStudentId
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
