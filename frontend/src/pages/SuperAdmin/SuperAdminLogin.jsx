import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const SuperAdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginSuperAdmin } = useApp();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await loginSuperAdmin(username, password);
        if (success) {
            navigate('/super-admin/dashboard');
        } else {
            setError('Invalid super admin credentials');
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="glass-panel w-full max-w-md rounded-2xl p-8 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-white">Super Admin</h2>
                    <p className="text-purple-300">Master Control Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm text-gray-400">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="glass-input w-full rounded-lg p-3 outline-none focus:border-purple-500"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input w-full rounded-lg p-3 outline-none focus:border-purple-500"
                            placeholder="Master Key"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                        Access Control
                    </button>
                    <div className="text-center text-xs text-gray-500">
                        Default: admin / admin123
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
