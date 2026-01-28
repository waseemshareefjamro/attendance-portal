import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const StudentLogin = () => {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginStudent } = useApp();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginStudent(studentId, password)) {
            navigate('/student/dashboard');
        } else {
            setError('Invalid ID or Password');
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="glass-panel w-full max-w-md rounded-2xl p-8 border-t-4 border-purple-500">
                <h2 className="mb-2 text-2xl font-bold text-center text-white">Student Portal</h2>
                <p className="mb-6 text-center text-gray-400 text-sm">View your attendance history</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm text-gray-400">Student ID</label>
                        <input
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="glass-input w-full rounded-lg p-3 outline-none focus:border-purple-500"
                            placeholder="e.g. STU001"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input w-full rounded-lg p-3 outline-none focus:border-purple-500"
                            placeholder="Enter your password"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center bg-red-500/10 p-2 rounded">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                        Access My Records
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentLogin;
