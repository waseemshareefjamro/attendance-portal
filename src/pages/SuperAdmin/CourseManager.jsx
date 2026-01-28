import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Trash2, BookOpen, GraduationCap, XCircle } from 'lucide-react';

const CourseManager = () => {
    const { classes, addCourse, removeCourse, instructors } = useApp();
    const [newCourse, setNewCourse] = useState({ name: '', id: '', instructorId: '' });
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleAdd = (e) => {
        e.preventDefault();
        if (newCourse.name && newCourse.id && newCourse.instructorId) {
            if (addCourse(newCourse)) {
                alert("Course Added!");
                setNewCourse({ name: '', id: '', instructorId: '' });
            } else {
                alert("Course ID already exists!");
            }
        } else {
            alert("Please fill all fields");
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this course? Enrollments will need cleanup.")) {
            removeCourse(id);
        }
    };

    const getInstructorName = (id) => {
        const instr = instructors.find(i => i.username === id);
        return instr ? (instr.name || instr.username) : 'Unknown';
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Course Management</h1>
                <p className="text-gray-400">Create courses and assign instructors</p>
            </header>

            {/* Add Course Form */}
            <div className="glass-panel p-8 rounded-xl h-fit">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus size={20} className="text-blue-400" /> Add New Course
                </h3>
                <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Course Name</label>
                        <input
                            type="text"
                            value={newCourse.name}
                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                            className="glass-input w-full rounded-lg p-3 outline-none"
                            placeholder="e.g. Introduction to Physics"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Course ID</label>
                        <input
                            type="text"
                            value={newCourse.id}
                            onChange={(e) => setNewCourse({ ...newCourse, id: e.target.value })}
                            className="glass-input w-full rounded-lg p-3 outline-none font-mono"
                            placeholder="e.g. PHY-101"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Assign Instructor</label>
                        <select
                            value={newCourse.instructorId}
                            onChange={(e) => setNewCourse({ ...newCourse, instructorId: e.target.value })}
                            className="glass-input w-full rounded-lg p-3 outline-none"
                            required
                        >
                            <option value="">-- Select Teacher --</option>
                            {instructors.map(i => (
                                <option key={i.username} value={i.username} className="text-black">
                                    {i.name} ({i.username})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        <BookOpen size={18} /> Create Course
                    </button>
                </form>
            </div>

            {/* Course List */}
            <div className="glass-panel p-8 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <GraduationCap size={20} className="text-purple-400" /> All Courses
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((course, idx) => (
                        <div key={idx} className="glass-panel group relative flex flex-col gap-2 rounded-xl p-6 transition-all hover:bg-white/10">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white text-lg">{course.name}</h4>
                                <span className="bg-white/10 text-xs px-2 py-1 rounded text-gray-300 font-mono">{course.id}</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                Instructor: <span className="text-blue-400">{getInstructorName(course.instructorId)}</span>
                            </p>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => setSelectedCourse(course)}
                                    className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"
                                >
                                    <BookOpen size={14} /> View Enrolled Students
                                </button>
                            </div>

                            <button
                                onClick={() => handleDelete(course.id)}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-400 hover:text-white transition-opacity bg-red-500/10 p-2 rounded hover:bg-red-500"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {classes.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            No courses available. Create one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Students List Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setSelectedCourse(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <XCircle size={24} />
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-2">{selectedCourse.name}</h3>
                        <p className="text-gray-400 mb-6">Course ID: <span className="font-mono">{selectedCourse.id}</span></p>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <EnrolledStudentsList courseId={selectedCourse.id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const EnrolledStudentsList = ({ courseId }) => {
    const { getStudentsByClass } = useApp();
    const students = getStudentsByClass(courseId);

    if (students.length === 0) {
        return <div className="text-center py-8 text-gray-500">No students enrolled in this course.</div>;
    }

    return (
        <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-xs uppercase text-gray-400 sticky top-0 backdrop-blur-md">
                <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
                {students.map(s => (
                    <tr key={s.StudentID} className="hover:bg-white/5">
                        <td className="px-4 py-3 font-mono">{s.StudentID}</td>
                        <td className="px-4 py-3 font-medium text-white">{s.Name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CourseManager;
