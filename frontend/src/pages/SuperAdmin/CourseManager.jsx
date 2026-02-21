import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Trash2, BookOpen, GraduationCap, XCircle, Pencil, Save } from 'lucide-react';

const CourseManager = () => {
    const { classes, addCourse, updateCourse, removeCourse, instructors } = useApp();
    const [formData, setFormData] = useState({ name: '', id: '', instructorId: '' });
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [editingDocId, setEditingDocId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.name && formData.id && formData.instructorId) {
            if (editingDocId) {
                // Update mode
                if (await updateCourse(editingDocId, formData)) {
                    alert("Course Updated!");
                    setEditingDocId(null);
                    setFormData({ name: '', id: '', instructorId: '' });
                }
            } else {
                // Add mode
                if (await addCourse(formData)) {
                    alert("Course Added!");
                    setFormData({ name: '', id: '', instructorId: '' });
                } else {
                    alert("Course ID already exists!");
                }
            }
        } else {
            alert("Please fill all fields");
        }
    };

    const startEdit = (course) => {
        setEditingDocId(course.$id);
        setFormData({ name: course.name, id: course.id, instructorId: course.instructorId });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingDocId(null);
        setFormData({ name: '', id: '', instructorId: '' });
    };

    const handleDelete = async (docId) => {
        if (window.confirm("Delete this course? Enrollments will need cleanup.")) {
            await removeCourse(docId);
        }
    };

    const getInstructorName = (id) => {
        const instr = instructors.find(i => i.Username === id);
        return instr ? (instr.Name || instr.Username) : 'Unknown';
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Course Management</h1>
                <p className="text-gray-400">Create courses and assign instructors</p>
            </header>

            {/* Course Form */}
            <div className={`glass-panel p-8 rounded-xl h-fit border transition-colors ${editingDocId ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10'}`}>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    {editingDocId ? <Pencil size={20} className="text-blue-400" /> : <Plus size={20} className="text-blue-400" />}
                    {editingDocId ? 'Edit Course' : 'Add New Course'}
                </h3>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Course Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="glass-input w-full rounded-lg p-3 outline-none"
                            placeholder="e.g. Introduction to Physics"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Course ID</label>
                        <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            className="glass-input w-full rounded-lg p-3 outline-none font-mono"
                            placeholder="e.g. PHY-101"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Assign Instructor</label>
                        <select
                            value={formData.instructorId}
                            onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                            className="glass-input w-full rounded-lg p-3 outline-none"
                            required
                        >
                            <option value="">-- Select Teacher --</option>
                            {instructors.map(i => (
                                <option key={i.Username} value={i.Username} className="text-black">
                                    {i.Name} ({i.Username})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition-colors ${editingDocId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {editingDocId ? <Save size={18} /> : <Plus size={18} />}
                            {editingDocId ? 'Update Course' : 'Create Course'}
                        </button>
                        {editingDocId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Course List */}
            <div className="glass-panel p-4 md:p-8 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <GraduationCap size={20} className="text-purple-400" /> All Courses
                </h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {classes.map((course, idx) => (
                        <div key={idx} className="glass-panel group relative flex flex-col gap-2 rounded-xl p-6 transition-all hover:bg-white/10 border border-white/5 hover:border-white/20">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white text-lg leading-tight">{course.name}</h4>
                                <span className="bg-white/10 text-[10px] px-2 py-1 rounded text-gray-300 font-mono shrink-0 ml-2">{course.id}</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                Instructor: <span className="text-blue-400">{getInstructorName(course.instructorId)}</span>
                            </p>

                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-3">
                                <button
                                    onClick={() => setSelectedCourse(course)}
                                    className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"
                                >
                                    <BookOpen size={14} /> View Enrolled
                                </button>

                                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-auto">
                                    <button
                                        onClick={() => startEdit(course)}
                                        className="text-blue-400 hover:text-white bg-blue-500/10 p-2 rounded hover:bg-blue-600 transition-colors"
                                        title="Edit Course"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.$id)}
                                        className="text-red-400 hover:text-white bg-red-500/10 p-2 rounded hover:bg-red-600 transition-colors"
                                        title="Delete Course"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
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
        <div className="overflow-x-auto">
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
        </div>
    );
};

export default CourseManager;
