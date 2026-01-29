import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const InstructorLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginInstructor } = useApp();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await loginInstructor(username, password);
        if (success) {
            navigate('/instructor/dashboard');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="glass-panel w-full max-w-md rounded-2xl p-8">
                <h2 className="mb-6 text-2xl font-bold text-center text-white">Instructor Access</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm text-gray-400">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="glass-input w-full rounded-lg p-3 outline-none focus:border-blue-500"
                            placeholder="e.g. instr1"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input w-full rounded-lg p-3 outline-none focus:border-blue-500"
                            placeholder="Enter password"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        Enter Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InstructorLogin;
