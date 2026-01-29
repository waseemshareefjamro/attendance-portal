import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { LogOut, LayoutDashboard, Database, UserCheck, Users, UserCog } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!currentUser) return null;

    return (
        <nav className="glass-panel sticky top-0 z-50 mb-8 border-b border-white/10 px-6 py-4">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
                        AttendanceSystem
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Instructor Navigation */}
                    {currentUser.role === 'instructor' && (
                        <>
                            <NavLink
                                to="/instructor/dashboard"
                                className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <LayoutDashboard size={18} />
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/instructor/classes"
                                className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <Database size={18} />
                                Classes
                            </NavLink>
                            <NavLink
                                to="/instructor/students"
                                className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <Users size={18} />
                                Students
                            </NavLink>
                            <NavLink
                                to="/instructor/attendance"
                                className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Attendance
                            </NavLink>
                        </>
                    )}

                    {/* Super Admin Navigation */}
                    {currentUser.role === 'super_admin' && (
                        <>
                            <NavLink
                                to="/super-admin/dashboard"
                                className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <UserCog size={18} />
                                Instructors
                            </NavLink>
                            <NavLink
                                to="/super-admin/students"
                                className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <Users size={18} />
                                Registry
                            </NavLink>
                            <NavLink
                                to="/super-admin/courses"
                                className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <Database size={18} />
                                Courses
                            </NavLink>
                        </>
                    )}

                    <div className="flex items-center gap-4">
                        <span className="text-gray-300 text-sm border-r border-white/10 pr-4">
                            {currentUser.role === 'super_admin' ? 'Super Admin' : (currentUser.data?.name || currentUser.data?.Name || currentUser.role)}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 hover:shadow-lg active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <LogOut size={16} />
                                Logout
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
