import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, UserCog, Shield } from 'lucide-react';

const InstructorManager = () => {
    const { instructors, addInstructor, updateInstructor, removeInstructor } = useApp();
    const [formData, setFormData] = useState({ username: '', password: '', name: '' });
    const [editingUsername, setEditingUsername] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('instructors'); // 'instructors' or 'grades'

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (editingUsername) {
            // Update Logic
            if (updateInstructor(editingUsername, formData)) {
                setSuccess(`Instructor updated successfully!`);
                setEditingUsername(null);
                setFormData({ username: '', password: '', name: '' });
            } else {
                setError('Username collision or update failed');
            }
        } else {
            // Add Logic
            if (addInstructor(formData.username, formData.password, formData.name)) {
                setSuccess(`Instructor added successfully!`);
                setFormData({ username: '', password: '', name: '' });
            } else {
                setError('Username already exists');
            }
        }
    };

    const startEdit = (instr) => {
        setEditingUsername(instr.username);
        setFormData({ username: instr.username, password: instr.password, name: instr.name || '' });
    };

    const handleDelete = (username) => {
        if (window.confirm(`Delete instructor ${username}? This cannot be undone.`)) {
            removeInstructor(username);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
                    <p className="text-gray-400">Manage instructors and system settings</p>
                </div>
                <div className="glass-panel p-1 rounded-lg flex items-center gap-1">
                    <button
                        onClick={() => setActiveTab('instructors')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'instructors' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Instructors
                    </button>
                    <button
                        onClick={() => setActiveTab('grades')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'grades' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Grades
                    </button>
                </div>
            </header>

            {activeTab === 'instructors' && (
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Add/Edit Form */}
                    <div className="glass-panel p-8 rounded-xl h-fit">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-blue-400" />
                            {editingUsername ? 'Edit Instructor' : 'Add New Instructor'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="glass-input w-full rounded-lg p-3 outline-none"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Username / Instructor ID</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="glass-input w-full rounded-lg p-3 outline-none"
                                    placeholder="instr_001"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Password</label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="glass-input w-full rounded-lg p-3 outline-none"
                                    placeholder="Secure password"
                                    required
                                />
                            </div>

                            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
                            {success && <p className="text-sm text-green-400 bg-green-500/10 p-2 rounded">{success}</p>}

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition-colors ${editingUsername ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    <UserCog size={18} /> {editingUsername ? 'Update' : 'Create'}
                                </button>
                                {editingUsername && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingUsername(null); setFormData({ username: '', password: '', name: '' }); }}
                                        className="px-4 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* List Instructors */}
                    <div className="glass-panel p-8 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-purple-400" /> Active Instructors
                        </h3>
                        <div className="space-y-3">
                            {instructors.map((instr, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold">
                                            {instr.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{instr.name || instr.username}</p>
                                            <p className="text-xs text-gray-400">Username: {instr.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(instr)} className="text-blue-400 hover:text-white p-2">Edit</button>
                                        <button onClick={() => handleDelete(instr.username)} className="text-red-400 hover:text-white p-2">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'grades' && (
                <div className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-white/5 p-4 rounded-full mb-4">
                        <Shield size={48} className="text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Grade Records Found</h3>
                    <p className="text-gray-400 max-w-sm">
                        Global grade reports will appear here once the system collects enough data.
                    </p>
                </div>
            )}
        </div>

    );
};

export default InstructorManager;
