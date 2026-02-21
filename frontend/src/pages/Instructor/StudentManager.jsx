import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

import { Plus, Users, Trash2, Search, Link as LinkIcon } from 'lucide-react';

const EnrollmentManager = () => {
    const { classes, getStudentsByClass, currentUser, attendance } = useApp();
    const [selectedClassId, setSelectedClassId] = useState('');
    const [viewingStudentId, setViewingStudentId] = useState(null);

    // Filter classes for this instructor
    const myClasses = classes.filter(c => c.instructorId === currentUser.data?.username);

    // Derived state: Students in correct class
    const roster = selectedClassId ? getStudentsByClass(selectedClassId) : [];
    const selectedClass = classes.find(c => c.id === selectedClassId);

    const getStudentHistory = (studentId) => {
        if (!selectedClassId) return [];
        // Filter attendance for this student AND this class
        return attendance.filter(a => a.studentId === studentId && a.classId === selectedClassId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    if (viewingStudentId) {
        const student = roster.find(s => s.StudentID === viewingStudentId);
        const history = getStudentHistory(viewingStudentId);

        // Calculate Stats
        const stats = {
            present: history.filter(h => h.status === 'Present').length,
            absent: history.filter(h => h.status === 'Absent').length,
            total: history.length
        };
        const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

        return (
            <div className="space-y-8">
                <header className="flex items-center gap-4">
                    <button
                        onClick={() => setViewingStudentId(null)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{student?.Name}</h1>
                        <p className="text-gray-400">Attendance Report for {selectedClass?.name}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-xl text-center">
                        <span className="block text-3xl font-bold text-green-400">{stats.present}</span>
                        <span className="text-xs text-gray-400 uppercase">Present</span>
                    </div>
                    <div className="glass-panel p-4 rounded-xl text-center">
                        <span className="block text-3xl font-bold text-red-400">{stats.absent}</span>
                        <span className="text-xs text-gray-400 uppercase">Absent</span>
                    </div>
                    <div className="glass-panel p-4 rounded-xl text-center">
                        <span className="block text-3xl font-bold text-blue-400">{percentage}%</span>
                        <span className="text-xs text-gray-400 uppercase">Attendance Rate</span>
                    </div>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 min-w-[500px]">
                        <thead className="bg-white/5 text-xs uppercase text-gray-200">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time Slot</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {history.length > 0 ? (
                                history.map((record, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{record.date}</td>
                                        <td className="px-6 py-4">{record.timeSlot || 'All Day'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'Present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="px-6 py-12 text-center">No attendance records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Class Roster</h1>
                <p className="text-gray-400">View students enrolled in your courses</p>
            </header>

            {/* Controls */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Select Course</label>
                    <select
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="glass-input w-full rounded-lg p-3 outline-none"
                    >
                        <option value="">-- Choose Course --</option>
                        {myClasses.map(c => <option key={c.id} value={c.id} className="text-black">{c.name} ({c.id})</option>)}
                    </select>
                </div>
                {myClasses.length === 0 && <p className="text-sm text-red-400">No courses assigned to you.</p>}
            </div>

            {/* Roster View */}
            {selectedClassId && selectedClass && (
                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-gray-400" />
                            <h3 className="font-semibold text-white">{selectedClass.name} <span className="text-gray-500 text-sm">({selectedClass.id})</span></h3>
                        </div>
                        <span className="text-xs text-gray-500">{roster.length} Students</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-xs uppercase text-gray-200">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {roster.map((s, i) => (
                                    <tr key={i} className="hover:bg-white/5 group">
                                        <td className="px-6 py-3 text-white font-mono">{s.StudentID}</td>
                                        <td className="px-6 py-3">{s.Name}</td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => setViewingStudentId(s.StudentID)}
                                                className="text-blue-400"
                                            >
                                                View Attendance
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {roster.length === 0 && (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center">No students enrolled in this class yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnrollmentManager;
