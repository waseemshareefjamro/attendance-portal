import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const ClassManager = () => {
    const { classes, currentUser, attendance } = useApp();
    const [viewingClassId, setViewingClassId] = useState(null);
    const [viewingSession, setViewingSession] = useState(null); // { date, timeSlot }

    // Filter classes for this instructor
    const myClasses = classes.filter(c => c.instructorId === currentUser?.data?.username);

    // Get stats for the viewing class
    const getClassHistory = (classId) => {
        const classRecords = attendance.filter(a => a.classId === classId);

        // Group by Date + TimeSlot unique session
        const sessions = {};

        classRecords.forEach(record => {
            const key = `${record.date}-${record.timeSlot || 'default'}`;
            if (!sessions[key]) {
                sessions[key] = {
                    date: record.date,
                    timeSlot: record.timeSlot || 'All Day',
                    present: 0,
                    absent: 0,
                    total: 0,
                    timestamp: record.timestamp,
                    records: [] // Store simplified records for drill-down check if needed, though we can filter later
                };
            }
            if (record.status === 'Present') sessions[key].present++;
            else sessions[key].absent++;
            sessions[key].total++;
        });

        // Convert to array and sort by date descending (Current -> Initial)
        return Object.values(sessions).sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const getSessionDetails = (classId, date, timeSlot) => {
        const records = attendance.filter(a =>
            a.classId === classId &&
            a.date === date &&
            (a.timeSlot === timeSlot || (!a.timeSlot && timeSlot === 'All Day'))
        );
        return records.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    };

    if (viewingSession) {
        const selectedClass = classes.find(c => c.id === viewingClassId);
        const sessionRecords = getSessionDetails(viewingClassId, viewingSession.date, viewingSession.timeSlot);

        return (
            <div className="mx-auto max-w-4xl space-y-8">
                <header className="flex items-center gap-4">
                    <button
                        onClick={() => setViewingSession(null)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        ← Back to History
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{selectedClass?.name}</h1>
                        <p className="text-gray-400">
                            {viewingSession.date} • <span className="text-blue-400">{viewingSession.timeSlot}</span>
                        </p>
                    </div>
                </header>

                <div className="glass-panel overflow-hidden rounded-xl">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-xs uppercase text-gray-200">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {sessionRecords.map((record, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{record.studentId}</td>
                                    <td className="px-6 py-4 font-medium text-white">{record.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (viewingClassId) {
        const selectedClass = classes.find(c => c.id === viewingClassId);
        const history = getClassHistory(viewingClassId);

        return (
            <div className="mx-auto max-w-4xl space-y-8">
                <header className="flex items-center gap-4">
                    <button
                        onClick={() => setViewingClassId(null)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{selectedClass?.name}</h1>
                        <p className="text-gray-400">Attendance History</p>
                    </div>
                </header>

                <div className="glass-panel overflow-hidden rounded-xl">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-xs uppercase text-gray-200">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time Slot</th>
                                <th className="px-6 py-4 text-center">Present</th>
                                <th className="px-6 py-4 text-center">Absent</th>
                                <th className="px-6 py-4 text-center">Total</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {history.length > 0 ? (
                                history.map((session, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => setViewingSession({ date: session.date, timeSlot: session.timeSlot })}
                                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 font-medium text-white">{session.date}</td>
                                        <td className="px-6 py-4">{session.timeSlot}</td>
                                        <td className="px-6 py-4 text-center text-green-400 font-bold">{session.present}</td>
                                        <td className="px-6 py-4 text-center text-red-400 font-bold">{session.absent}</td>
                                        <td className="px-6 py-4 text-center">{session.total}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                                                View Details →
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No attendance records found for this class.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">My Courses</h1>
                <p className="text-gray-400">Courses assigned to you</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myClasses.map((cls, idx) => (
                    <div key={idx} className="glass-panel group relative flex flex-col items-start justify-between rounded-xl p-6 transition-all hover:bg-white/15">
                        <div className="w-full">
                            <h3 className="font-bold text-white text-lg">{cls.name}</h3>
                            <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded mt-2 inline-block">{cls.id}</span>
                        </div>

                        <div className="mt-6 w-full pt-4 border-t border-white/5">
                            <button
                                onClick={() => setViewingClassId(cls.id)}
                                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                View History
                            </button>
                        </div>
                    </div>
                ))}
                {myClasses.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No courses assigned to you. Contact Super Admin.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassManager;
