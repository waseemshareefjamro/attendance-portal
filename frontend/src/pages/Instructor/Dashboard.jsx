import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Users, Database, Clock } from 'lucide-react';

const Dashboard = () => {
    const { classes, attendance, currentUser, getStudentsByClass } = useApp();

    // Filter data for this instructor
    const myClasses = classes.filter(c => c.instructorId === currentUser?.data?.username);
    const myClassIds = myClasses.map(c => c.id);

    // Calculate unique students for this instructor
    const myStudents = new Set();
    myClasses.forEach(cls => {
        const classStudents = getStudentsByClass(cls.id);
        classStudents.forEach(s => myStudents.add(s.StudentID));
    });

    const totalStudents = myStudents.size;
    const totalClasses = myClasses.length;

    // Calculate Today's Attendance for this instructor's classes
    const today = new Date().toISOString().split('T')[0]; // Use ISO YYYY-MM-DD to match Attendance Manager
    const todaysAttendance = attendance.filter(a => a.date === today && myClassIds.includes(a.classId)).length;

    const stats = [
        { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Active Classes', value: totalClasses, icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: "Today's Attendance", value: todaysAttendance, icon: Clock, color: 'text-green-400', bg: 'bg-green-500/10' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Instructor Dashboard</h1>
                <p className="text-gray-400">Welcome, {currentUser?.data?.name || currentUser?.data?.username}</p>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-panel flex items-center gap-4 rounded-xl p-6">
                        <div className={`rounded-lg p-3 ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel rounded-xl p-6">
                <h3 className="mb-4 text-xl font-bold text-white">Quick Actions</h3>
                <div className="flex gap-4">
                    {/* Placeholders for quick actions if needed */}
                    <div className="p-4 rounded bg-white/5 border border-white/10 w-full text-center text-gray-500">
                        Select a tab from the navigation bar to manage data.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
