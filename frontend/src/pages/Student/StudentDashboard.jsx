import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, XCircle, Calendar, BookOpen } from 'lucide-react';

const StudentDashboard = () => {
    const { currentUser, attendance, getClassesByStudent, classes } = useApp();
    const student = currentUser?.data;

    // Derived: Get Enrolled Class IDs (Array of Strings)
    const enrolledClassIds = student ? getClassesByStudent(student.StudentID) : [];

    // Map IDs to full Class Objects
    const enrolledCourses = _mapIdsToCourses(enrolledClassIds, classes);

    // Add legacy class if it exists and isn't already covered
    let myClasses = [...enrolledCourses];
    if (student?.Class && !myClasses.find(c => c.name === student.Class || c.id === student.Class)) {
        // Create a synthetic course object for the legacy class
        myClasses.push({ id: student.Class, name: student.Class, instructorId: '' });
    }

    // Helper to safely map IDs to Objects
    function _mapIdsToCourses(ids, allClasses) {
        return ids.map(id => allClasses.find(c => c.id === id)).filter(Boolean);
    }

    // State: Default to first class if available, else empty string
    const [selectedClassId, setSelectedClassId] = useState('');

    // Initialize selection when classes load
    useEffect(() => {
        if (myClasses.length > 0 && !selectedClassId) {
            setSelectedClassId(myClasses[0].id);
        }
    }, [myClasses, selectedClassId]);

    if (!student) return null;

    // Filter attendance for this student AND selected class ONLY
    const myAttendance = attendance.filter(a => {
        // Robust Match: Normalize both IDs for comparison
        const recordStudentId = String(a.studentId).trim().toLowerCase();
        const currentStudentId = String(student.StudentID).trim().toLowerCase();

        const isMe = recordStudentId === currentStudentId;

        if (!selectedClassId) return false;

        // Normalize selectedClassId
        const selectedIdNormalized = String(selectedClassId).trim().toLowerCase();

        // Get Name for legacy comparison
        const targetCourse = myClasses.find(c => c.id === selectedClassId);
        const targetNameNormalized = String(targetCourse ? targetCourse.name : selectedClassId).trim().toLowerCase();

        // Check if record matches ID (New Style)
        const recordClassId = String(a.classId || '').trim().toLowerCase();
        const isClassIdMatch = recordClassId === selectedIdNormalized;

        // Check if record matches Name (Legacy Style)
        const recordClassName = String(a.class || a.className || '').trim().toLowerCase();
        const isClassNameMatch = recordClassName === targetNameNormalized;

        return isMe && (isClassIdMatch || isClassNameMatch);
    });

    // Stats
    const totalDays = myAttendance.length;
    const presentDays = myAttendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Helper to get name
    const selectedCourseName = myClasses.find(c => c.id === selectedClassId)?.name || 'Select a Course';

    // Tab State
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'grades'

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                        {student.Name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Hello, {student.Name}</h1>
                        <p className="text-gray-400">ID: {student.StudentID}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="glass-panel p-1 rounded-lg flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Attendance
                        </button>
                        <button
                            onClick={() => setActiveTab('grades')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'grades' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Grades
                        </button>
                    </div>

                    <div className="glass-panel p-2 rounded-lg flex items-center gap-2">
                        <BookOpen size={16} className="text-gray-400" />
                        <select
                            value={selectedClassId}
                            onChange={e => setSelectedClassId(e.target.value)}
                            className="glass-input bg-transparent outline-none text-sm w-[150px]"
                        >
                            {myClasses.length === 0 && <option value="">No Courses Enrolled</option>}
                            {myClasses.map((c, idx) => (
                                <option key={`course-${idx}`} value={c.id} className="text-black">
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {activeTab === 'attendance' && (
                <>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="glass-panel p-6 rounded-xl text-center">
                            <p className="text-gray-400 text-sm mb-1">Attendance Rate</p>
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                {attendancePercentage}%
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{selectedCourseName}</p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl text-center">
                            <p className="text-gray-400 text-sm mb-1">Total Classes</p>
                            <div className="text-3xl font-bold text-white">{totalDays}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-xl text-center">
                            <p className="text-gray-400 text-sm mb-1">Days Present</p>
                            <div className="text-3xl font-bold text-green-400">{presentDays}</div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-white">Attendance History</h3>
                            <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">{selectedCourseName}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-xs uppercase text-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Class</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Time Recorded</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {myAttendance.slice().reverse().map((record, i) => (
                                        <tr key={i} className="hover:bg-white/5">
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-500" />
                                                {record.date}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                {record.className || record.class}
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.status === 'Present' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 border border-green-500/20">
                                                        <CheckCircle size={12} /> Present
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 border border-red-500/20">
                                                        <XCircle size={12} /> Absent
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                                {new Date(record.timestamp).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {myAttendance.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-12 text-center">No attendance records found for this course.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'grades' && (
                <div className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-white/5 p-4 rounded-full mb-4">
                        <BookOpen size={48} className="text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Grades Yet</h3>
                    <p className="text-gray-400 max-w-sm">
                        There are no grade records found for <span className="text-purple-400">{selectedCourseName}</span>.
                        Check back later when your instructor publishes results.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
