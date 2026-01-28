import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { exportToExcel } from '../../utils/excelUtils';
import { CheckCircle, XCircle, Save, Calendar, Download } from 'lucide-react';

const AttendanceManager = () => {
    const { classes, students, markAttendance, attendance, currentUser, getStudentsByClass } = useApp();
    const [selectedClassId, setSelectedClassId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [durationHours, setDurationHours] = useState(1);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

    // attendanceMap: { [studentId]: 'Present' | 'Absent' }
    const [attendanceMap, setAttendanceMap] = useState({});

    // Filter classes for this instructor
    const myClasses = classes.filter(c => c.instructorId === currentUser?.data?.username);
    const selectedClass = classes.find(c => c.id === selectedClassId);

    // Get students from enrollments
    const classStudents = selectedClassId ? getStudentsByClass(selectedClassId) : [];

    // Generate Time Slots based on Start Time + Duration
    const timeSlots = React.useMemo(() => {
        if (!startTime) return [];
        const slots = [];

        // Helper to format time
        const formatTime = (h, m) => {
            // Adjust for minute overflow
            h += Math.floor(m / 60);
            m = m % 60;
            // Adjust for 24h wrap
            h = h % 24;

            const period = h >= 12 ? 'PM' : 'AM';
            const showH = h % 12 || 12;
            const showM = m.toString().padStart(2, '0');
            return `${showH}:${showM} ${period}`;
        };

        const [startH, startM] = startTime.split(':').map(Number);

        // 1. Calculate Full Duration Slot
        const totalMinutes = (durationHours * 60) + durationMinutes;
        if (totalMinutes > 0) {
            const endM = startM + totalMinutes;
            const fullSlot = `${formatTime(startH, startM)} - ${formatTime(startH, endM)} (Full Class)`;
            slots.push(fullSlot);
        }

        // 2. Generate Sub-slots if duration is substantial (e.g. > 45 mins) to allow granular attendance
        // Simpler Sub-slot Loop
        if (totalMinutes > 60) {
            // Reset
            const subSlots = [];
            let currentTotalM = (startH * 60) + startM;
            let timeLeft = totalMinutes;

            while (timeLeft > 0) {
                const chunk = timeLeft >= 60 ? 60 : timeLeft;
                if (chunk < 10) break; // Ignore tiny remainders

                const startTimestamp = currentTotalM;
                const endTimestamp = currentTotalM + chunk;

                const sH = Math.floor(startTimestamp / 60);
                const sM = startTimestamp % 60;
                const eH = Math.floor(endTimestamp / 60);
                const eM = endTimestamp % 60;

                subSlots.push(`${formatTime(sH, sM)} - ${formatTime(eH, eM)}`);

                currentTotalM += chunk;
                timeLeft -= chunk;
            }
            // Add subslots after the full slot
            slots.push(...subSlots);
        }

        return slots;
    }, [startTime, durationHours, durationMinutes]);

    // Auto-select first slot
    React.useEffect(() => {
        if (timeSlots.length > 0 && !timeSlots.includes(selectedTimeSlot)) {
            setSelectedTimeSlot(timeSlots[0]);
        }
    }, [timeSlots]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = () => {
        if (!selectedClassId) return;

        const records = classStudents.map(student => ({
            id: `${student.StudentID}-${date}-${selectedClassId}-${selectedTimeSlot.replace(/\s/g, '')}`, // Unique ID composite
            studentId: student.StudentID,
            name: student.Name,
            classId: selectedClassId,
            className: selectedClass?.name,
            date: date,
            timeSlot: selectedTimeSlot,
            status: attendanceMap[student.StudentID] || 'Present',
            timestamp: new Date().toISOString()
        }));

        records.forEach(r => markAttendance(r));
        alert('Attendance saved successfully!');
    };

    const handleExport = () => {
        if (!selectedClassId) return;
        // Export attendance for this class
        const classAttendance = attendance.filter(a => a.classId === selectedClassId);
        exportToExcel(classAttendance, `Attendance_${selectedClass?.name || selectedClassId}`);
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Mark Attendance</h1>
                <p className="text-gray-400">Record daily attendance for classes</p>
            </header>

            {/* Controls */}
            <div className="glass-panel p-6 rounded-xl grid gap-4 md:grid-cols-4 items-end">
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
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="glass-input w-full rounded-lg p-3 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-sm text-gray-400">Start Time</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="glass-input w-full rounded-lg p-3 outline-none"
                            />
                        </div>
                        <div className="w-20">
                            <label className="text-sm text-gray-400">Hrs</label>
                            <input
                                type="number"
                                min="0"
                                max="12"
                                value={durationHours}
                                onChange={e => setDurationHours(parseInt(e.target.value) || 0)}
                                className="glass-input w-full rounded-lg p-3 outline-none"
                            />
                        </div>
                        <div className="w-20">
                            <label className="text-sm text-gray-400">Mins</label>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                step="5"
                                value={durationMinutes}
                                onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                                className="glass-input w-full rounded-lg p-3 outline-none"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Time Slot</label>
                    <select
                        value={selectedTimeSlot}
                        onChange={e => setSelectedTimeSlot(e.target.value)}
                        className="glass-input w-full rounded-lg p-3 outline-none font-mono text-sm"
                    >
                        {timeSlots.map(slot => <option key={slot} value={slot} className="text-black">{slot}</option>)}
                    </select>
                </div>
                <div className="flex gap-2 md:col-span-4 mt-4">
                    <button
                        onClick={handleExport}
                        disabled={!selectedClassId}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} /> Export History
                    </button>
                </div>
            </div>

            {/* List */}
            {selectedClassId && (
                <div className="glass-panel rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-xs uppercase text-gray-200">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {classStudents.map(student => {
                                const status = attendanceMap[student.StudentID] || 'Present'; // Default visual state
                                return (
                                    <tr key={student.StudentID} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{student.StudentID}</td>
                                        <td className="px-6 py-4 font-medium text-white">{student.Name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => handleStatusChange(student.StudentID, 'Present')}
                                                    className={`flex items-center gap-1 rounded-full px-3 py-1 transition-all ${status === 'Present' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
                                                >
                                                    <CheckCircle size={16} /> Present
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.StudentID, 'Absent')}
                                                    className={`flex items-center gap-1 rounded-full px-3 py-1 transition-all ${status === 'Absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
                                                >
                                                    <XCircle size={16} /> Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {classStudents.length === 0 && (
                                <tr><td colSpan="3" className="px-6 py-12 text-center">No students enrolled in this course.</td></tr>
                            )}
                        </tbody>
                    </table>

                    {classStudents.length > 0 && (
                        <div className="p-6 border-t border-white/10 bg-white/5">
                            <button
                                onClick={handleSave}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01] hover:bg-blue-500"
                            >
                                <Save size={20} /> Save Attendance Records
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendanceManager;
