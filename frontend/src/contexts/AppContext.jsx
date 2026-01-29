import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // State for students registry (Global List)
    // Structure: { StudentID, Name, Password }
    const [students, setStudents] = useState(() => {
        const saved = localStorage.getItem('students');
        return saved ? JSON.parse(saved) : [];
    });

    // State for enrollments (Mapping Students <-> Classes)
    // Structure: { studentId, classId }
    const [enrollments, setEnrollments] = useState(() => {
        const saved = localStorage.getItem('enrollments');
        return saved ? JSON.parse(saved) : [];
    });

    // State for attendance records
    // Structure: { id, studentId, date, status, time, classId, ... }
    const [attendance, setAttendance] = useState(() => {
        const saved = localStorage.getItem('attendance');
        return saved ? JSON.parse(saved) : [];
    });

    // State for classes
    const [classes, setClasses] = useState(() => {
        const saved = localStorage.getItem('classes');
        const parsed = saved ? JSON.parse(saved) : [];
        // Migration check: if old data (strings), convert to objects
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
            return parsed.map(c => ({ id: c, name: c, instructorId: '' }));
        }
        return parsed;
    });

    // State for Instructors
    const [instructors, setInstructors] = useState(() => {
        const saved = localStorage.getItem('instructors');
        return saved ? JSON.parse(saved) : [{ username: 'instr1', password: 'password', name: 'Default Instructor' }];
    });

    const [currentUser, setCurrentUser] = useState(null);

    // Persistence
    useEffect(() => { localStorage.setItem('students', JSON.stringify(students)); }, [students]);
    useEffect(() => { localStorage.setItem('enrollments', JSON.stringify(enrollments)); }, [enrollments]);
    useEffect(() => { localStorage.setItem('instructors', JSON.stringify(instructors)); }, [instructors]);
    useEffect(() => { localStorage.setItem('attendance', JSON.stringify(attendance)); }, [attendance]);
    useEffect(() => { localStorage.setItem('classes', JSON.stringify(classes)); }, [classes]);

    // --- Actions ---

    // 1. Registry Management (Super Admin)
    const addStudent = (student) => {
        // Enforce uniqueness
        if (students.find(s => s.StudentID === student.StudentID)) return false;
        setStudents(prev => [...prev, student]);
        return true;
    };

    const addStudentsBulk = (newStudents) => {
        setStudents(prev => {
            const existingIds = new Set(prev.map(s => s.StudentID));
            const filtered = newStudents.filter(s => !existingIds.has(s.StudentID));
            return [...prev, ...filtered];
        });
    };

    const updateStudent = (oldId, updatedData) => {
        const newId = updatedData.StudentID || oldId;

        // If ID changed, check uniqueness
        if (newId !== oldId && students.find(s => s.StudentID === newId)) {
            return false; // ID collision
        }

        setStudents(prev => prev.map(student =>
            student.StudentID === oldId ? { ...student, ...updatedData, StudentID: newId } : student
        ));

        // Cascade ID update if needed
        if (newId !== oldId) {
            setEnrollments(prev => prev.map(e => e.studentId === oldId ? { ...e, studentId: newId } : e));
            setAttendance(prev => prev.map(a => a.studentId === oldId ? { ...a, studentId: newId } : a));
        }
        return true;
    };

    const removeStudentRaw = (id) => { // Removes from registry completely
        setStudents(prev => prev.filter(student => student.StudentID !== id));
        setEnrollments(prev => prev.filter(e => e.studentId !== id));
        setAttendance(prev => prev.filter(a => a.studentId !== id));
    };

    // 2. Enrollment Management (Instructors)
    const enrollStudent = (studentId, classId) => {
        // Check if student exists in registry
        const studentExists = students.some(s => s.StudentID === studentId);
        if (!studentExists) return false;

        // Check if already enrolled
        const isEnrolled = enrollments.some(e => e.studentId === studentId && e.classId === classId);
        if (isEnrolled) return true; // Already done

        setEnrollments(prev => [...prev, { studentId, classId }]);
        return true;
    };

    const unenrollStudent = (studentId, classId) => {
        setEnrollments(prev => prev.filter(e => !(e.studentId === studentId && e.classId === classId)));
    };

    // 3. Helpers
    const getStudentsByClass = (classId) => {
        const targetClassId = String(classId).toLowerCase();
        const enrolledIds = enrollments
            .filter(e => String(e.classId).toLowerCase() === targetClassId)
            .map(e => String(e.studentId).toLowerCase());

        return students.filter(s => enrolledIds.includes(String(s.StudentID).toLowerCase()));
    };

    const getClassesByStudent = (studentId) => {
        const targetStudentId = String(studentId).toLowerCase();
        return enrollments
            .filter(e => String(e.studentId).toLowerCase() === targetStudentId)
            .map(e => e.classId);
    };

    // 4. Other Actions
    const markAttendance = (record) => {
        setAttendance(prev => [...prev, record]);
    };

    // Course Management (Super Admin)
    const addCourse = (course) => {
        // course: { id, name, instructorId }
        if (classes.find(c => c.id === course.id)) return false;
        setClasses(prev => [...prev, course]);
        return true;
    };

    const removeCourse = (courseId) => {
        setClasses(prev => prev.filter(c => c.id !== courseId));
    };

    const addClass = (className) => {
        addCourse({ id: className, name: className, instructorId: '' });
    };

    // Instructor Management
    const addInstructor = (username, password, name) => {
        if (!instructors.find(i => i.username === username)) {
            setInstructors(prev => [...prev, { username, password, name }]);
            return true;
        }
        return false;
    };

    const updateInstructor = (oldUsername, newData) => {
        const newUsername = newData.username || oldUsername;

        // If Username changed, check uniqueness
        if (newUsername !== oldUsername && instructors.find(i => i.username === newUsername)) {
            return false;
        }

        setInstructors(prev => prev.map(i =>
            i.username === oldUsername ? { ...i, ...newData, username: newUsername } : i
        ));
        return true;
    };

    const removeInstructor = (username) => {
        setInstructors(prev => prev.filter(i => i.username !== username));
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
    const loginStudent = (studentId, password) => {
        const student = students.find(s => s.StudentID === studentId);
        if (student && student.Password === password) {
            setCurrentUser({ role: 'student', data: student });
            return true;
        }
        return false;
    };

    const loginInstructor = (username, password) => {
        const instructor = instructors.find(i => i.username === username && i.password === password);
        if (instructor) {
            setCurrentUser({ role: 'instructor', data: instructor });
            return true;
        }
        return false;
    };

    const loginSuperAdmin = (username, password) => {
        if (username === 'admin' && password === 'admin123') {
            setCurrentUser({ role: 'super_admin', data: { name: 'Super Admin' } });
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <AppContext.Provider value={{
            students, enrollments, attendance, classes, instructors, currentUser,
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
