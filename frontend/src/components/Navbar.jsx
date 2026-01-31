import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { LogOut, LayoutDashboard, Database, UserCheck, Users, UserCog, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useApp();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    if (!currentUser) return null;

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'} py-2 md:py-0`}
        >
            <Icon size={18} />
            {label}
        </NavLink>
    );

    return (
        <nav className="glass-panel sticky top-0 z-50 mb-8 border-b border-white/10 px-6 py-4">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
                        Attendance
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-400 hover:text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Instructor Navigation */}
                    {currentUser.role === 'instructor' && (
                        <>
                            <NavItem to="/instructor/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <NavItem to="/instructor/classes" icon={Database} label="Classes" />
                            <NavItem to="/instructor/students" icon={Users} label="Students" />
                            <NavItem to="/instructor/attendance" icon={UserCheck} label="Attendance" />
                        </>
                    )}

                    {/* Super Admin Navigation */}
                    {currentUser.role === 'super_admin' && (
                        <>
                            <NavItem to="/super-admin/dashboard" icon={UserCog} label="Instructors" />
                            <NavItem to="/super-admin/students" icon={Users} label="Registry" />
                            <NavItem to="/super-admin/courses" icon={Database} label="Courses" />
                        </>
                    )}

                    <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                        <span className="text-gray-300 text-sm">
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

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden pt-4 pb-2 space-y-4 border-t border-white/10 mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex flex-col gap-2">
                        {currentUser.role === 'instructor' && (
                            <>
                                <NavItem to="/instructor/dashboard" icon={LayoutDashboard} label="Dashboard" />
                                <NavItem to="/instructor/classes" icon={Database} label="Classes" />
                                <NavItem to="/instructor/students" icon={Users} label="Students" />
                                <NavItem to="/instructor/attendance" icon={UserCheck} label="Attendance" />
                            </>
                        )}

                        {currentUser.role === 'super_admin' && (
                            <>
                                <NavItem to="/super-admin/dashboard" icon={UserCog} label="Instructors" />
                                <NavItem to="/super-admin/students" icon={Users} label="Registry" />
                                <NavItem to="/super-admin/courses" icon={Database} label="Courses" />
                            </>
                        )}
                    </div>

                    <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                        <span className="text-gray-300 text-sm">
                            Logged in as: <span className="text-white font-medium">{currentUser.role === 'super_admin' ? 'Super Admin' : (currentUser.data?.name || currentUser.data?.Name || currentUser.role)}</span>
                        </span>

                        <button
                            onClick={handleLogout}
                            className="w-full rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/20"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <LogOut size={16} />
                                Logout
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
