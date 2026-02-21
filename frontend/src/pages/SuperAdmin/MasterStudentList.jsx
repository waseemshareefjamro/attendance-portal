import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { readExcelFile } from '../../utils/excelUtils';
import FileUpload from '../../components/FileUpload';
import { Plus, Users, Save, Trash2, Shield, Pencil, BookOpen, UserMinus, UserPlus } from 'lucide-react';

const MasterStudentList = () => {
    const { students, addStudent, addStudentsBulk, generateCredential, generateStudentId, removeStudentRaw, updateStudent, classes, getClassesByStudent, enrollStudent, unenrollStudent } = useApp();
    const [activeTab, setActiveTab] = useState('add');
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ Name: '', StudentID: '', Password: '', Gender: 'Male' });
    const [editingId, setEditingId] = useState(null);

    // Enrollment Management State
    const [managingStudent, setManagingStudent] = useState(null); // Full student object
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const handleGenerate = () => {
        setFormData(prev => ({
            ...prev,
            StudentID: prev.StudentID || generateStudentId(),
            Password: prev.Password || generateCredential()
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.Name || !formData.StudentID || !formData.Password) {
            alert("All fields are required");
            return;
        }

        if (editingId) {
            // Update
            if (updateStudent(editingId, formData)) {
                alert("Student Updated!");
                setEditingId(null);
                setFormData({ Name: '', StudentID: '', Password: '', Gender: 'Male' });
            } else {
                alert("Update failed. ID might be taken.");
            }
        } else {
            // Create
            if (addStudent(formData)) {
                alert(`Student Created!\nID: ${formData.StudentID}\nName: ${formData.Name}`);
                setFormData({ Name: '', StudentID: '', Password: '', Gender: 'Male' });
            } else {
                alert("Student ID already exists!");
            }
        }
    };

    const startEdit = (student) => {
        setEditingId(student.$id);
        setFormData({ Name: student.Name, StudentID: student.StudentID, Password: student.Password, Gender: student.Gender || 'Male' });
        setActiveTab('add');
    };

    const handleImport = async (file) => {
        if (!file) return;
        setLoading(true);
        try {
            const data = await readExcelFile(file);
            const validData = data.filter(r => r.Name).map(r => ({
                Name: r.Name,
                StudentID: r.StudentID || generateStudentId(),
                Password: r.Password || generateCredential(),
                Gender: r.Gender || 'Male'
            }));

            if (validData.length > 0) {
                addStudentsBulk(validData);
                alert(`Successfully imported ${validData.length} students!`);
            }
        } catch (error) {
            console.error(error);
            alert('Error parsing file');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this student permanently? This will remove them from ALL courses.")) {
            removeStudentRaw(id);
        }
    };

    // Enrollment Management Logic
    const handleAddCourse = () => {
        if (!selectedCourseId || !managingStudent) return;
        // Enroll using StudentID, CourseID and Name
        enrollStudent(managingStudent.StudentID, selectedCourseId, managingStudent.Name);
        setSelectedCourseId('');
    };

    const handleRemoveCourse = (courseId) => {
        if (window.confirm(`Unenroll ${managingStudent.Name} from this course?`)) {
            unenrollStudent(managingStudent.StudentID, courseId);
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Enrollment Modal */}
            {managingStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1f3c] border border-white/10 rounded-xl p-8 max-w-lg w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Manage Enrollments</h2>
                                <p className="text-gray-400">for {managingStudent.Name} ({managingStudent.StudentID})</p>
                            </div>
                            <button onClick={() => setManagingStudent(null)} className="text-gray-500 hover:text-white">✕</button>
                        </div>

                        {/* Add Course */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-gray-500">Add to Course</label>
                            <div className="flex gap-2">
                                <select
                                    className="glass-input flex-1 rounded-lg p-2 outline-none"
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                >
                                    <option value="">Select Course...</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id} className="text-black">{c.name} ({c.id})</option>
                                    ))}
                                </select>
                                <button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 flex items-center gap-1">
                                    <UserPlus size={16} /> Enroll
                                </button>
                            </div>
                        </div>

                        {/* Current Courses */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-gray-500">Enrolled Courses</label>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {getClassesByStudent(managingStudent.StudentID).length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Not enrolled in any courses.</p>
                                ) : (
                                    getClassesByStudent(managingStudent.StudentID).map(classId => {
                                        const course = classes.find(c => c.id === classId) || { name: 'Unknown Course', id: classId };
                                        return (
                                            <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                                <span className="text-white text-sm">{course.name} ({course.id})</span>
                                                <button onClick={() => handleRemoveCourse(course.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded">
                                                    <UserMinus size={16} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-end">
                            <button onClick={() => setManagingStudent(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">Done</button>
                        </div>
                    </div>
                </div>
            )}

            <header>
                <h1 className="text-3xl font-bold text-white">Master Student Registry</h1>
                <p className="text-gray-400">Create, edit, and manage global student identities</p>
            </header>

            <div className="glass-panel p-2 rounded-xl flex gap-2 w-fit">
                <button onClick={() => { setActiveTab('add'); setEditingId(null); setFormData({ Name: '', StudentID: '', Password: '', Gender: 'Male' }); }} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    {editingId ? 'Edit Student' : 'Create Single'}
                </button>
                <button onClick={() => setActiveTab('import')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'import' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Bulk Import</button>
                <button onClick={() => setActiveTab('grades')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'grades' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Grades</button>
            </div>

            <div className="glass-panel rounded-xl p-8">
                {activeTab === 'add' && (
                    <form onSubmit={handleSubmit} className="max-w-4xl space-y-4">
                        <div className="flex gap-4 items-end flex-wrap">
                            <div className="flex-1 min-w-[200px] space-y-2">
                                <label className="text-sm text-gray-400">Full Name</label>
                                <input
                                    value={formData.Name}
                                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                    className="glass-input w-full rounded-lg p-3 outline-none"
                                    placeholder="Student Name"
                                    required
                                />
                            </div>
                            <div className="flex-1 min-w-[150px] space-y-2">
                                <label className="text-sm text-gray-400">Student ID</label>
                                <input
                                    value={formData.StudentID}
                                    onChange={(e) => setFormData({ ...formData, StudentID: e.target.value })}
                                    className="glass-input w-full rounded-lg p-3 outline-none font-mono"
                                    placeholder="e.g. STU1234"
                                    required
                                />
                            </div>
                            <div className="flex-1 min-w-[120px] space-y-2">
                                <label className="text-sm text-gray-400">Gender</label>
                                <select
                                    value={formData.Gender}
                                    onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                                    className="glass-input w-full rounded-lg p-3 outline-none"
                                >
                                    <option value="Male" className="text-black">Male</option>
                                    <option value="Female" className="text-black">Female</option>
                                    <option value="Other" className="text-black">Other</option>
                                </select>
                            </div>
                            <div className="flex-1 min-w-[150px] space-y-2">
                                <label className="text-sm text-gray-400">Password</label>
                                <input
                                    value={formData.Password}
                                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                                    className="glass-input w-full rounded-lg p-3 outline-none font-mono"
                                    placeholder="Secret"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={handleGenerate} className="text-sm text-blue-400 hover:text-white underline self-start">
                                Auto-Generate ID & Pass
                            </button>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button type="submit" className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                <Save size={20} /> {editingId ? 'Update Student' : 'Create Account'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setFormData({ Name: '', StudentID: '', Password: '', Gender: 'Male' }); }} className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700">Cancel</button>
                            )}
                        </div>
                    </form>
                )}
                {activeTab === 'import' && (
                    <div className="max-w-xl space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Upload Excel (Columns: Name, [Optional: StudentID, Gender])</label>
                            <FileUpload onFileSelect={handleImport} />
                        </div>
                        {loading && <p className="text-gray-400">Processing...</p>}
                    </div>
                )}
                {activeTab === 'grades' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-white/5 p-4 rounded-full mb-4">
                            <BookOpen size={48} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Grade Records Found</h3>
                        <p className="text-gray-400 max-w-sm">
                            Grade records will appear here once instructors publish them.
                        </p>
                    </div>
                )}
            </div>

            {/* Student List */}
            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield size={20} className="text-purple-400" />
                        <h3 className="font-semibold text-white">All Registered Students</h3>
                    </div>
                    <span className="text-xs text-gray-500">Total: {students.length}</span>
                </div>
                <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-xs uppercase text-gray-200 sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Password</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Gender</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {students.slice().reverse().map((s, i) => (
                                <tr key={i} className="hover:bg-white/5 group">
                                    <td className="px-6 py-3 text-white font-mono">{s.StudentID}</td>
                                    <td className="px-6 py-3 font-mono text-yellow-400">{s.Password}</td>
                                    <td className="px-6 py-3">{s.Name}</td>
                                    <td className="px-6 py-3">{s.Gender || 'Male'}</td>
                                    <td className="px-6 py-3 flex justify-end gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setManagingStudent(s)} className="text-purple-400 hover:text-white p-2 hover:bg-purple-500/20 rounded" title="Manage Courses">
                                            <BookOpen size={16} />
                                        </button>
                                        <button onClick={() => startEdit(s)} className="text-blue-400 hover:text-white p-2 hover:bg-blue-500/20 rounded" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(s.$id)} className="text-red-400 hover:text-white p-2 hover:bg-red-500/20 rounded" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MasterStudentList;
