import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Navbar from './components/Navbar';

// Login Pages
import InstructorLogin from './pages/Instructor/InstructorLogin';
import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin';
import StudentLogin from './pages/Student/StudentLogin';

// Instructor Pages
import Dashboard from './pages/Instructor/Dashboard';
import ClassManager from './pages/Instructor/ClassManager';
import EnrollmentManager from './pages/Instructor/StudentManager'; // Filename kept, logic changed
import AttendanceManager from './pages/Instructor/AttendanceManager';

// Super Admin Pages
import InstructorManager from './pages/SuperAdmin/InstructorManager';
import MasterStudentList from './pages/SuperAdmin/MasterStudentList';
import CourseManager from './pages/SuperAdmin/CourseManager';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser } = useApp();

  if (!currentUser) return <Navigate to="/" replace />;
  if (role && currentUser.role !== role) {
    if (currentUser.role === 'super_admin') return <Navigate to="/super-admin/dashboard" />;
    if (currentUser.role === 'instructor') return <Navigate to="/instructor/dashboard" />;
    if (currentUser.role === 'student') return <Navigate to="/student/dashboard" />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen text-white/90">
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 pb-12">
            <Routes>
              {/* Public / Selector */}
              <Route path="/" element={<HomeSelector />} />

              {/* Auth Routes */}
              <Route path="/instructor-login" element={<InstructorLogin />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/super-admin-login" element={<SuperAdminLogin />} />

              {/* Instructor Routes */}
              <Route path="/instructor/dashboard" element={
                <ProtectedRoute role="instructor">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/instructor/classes" element={
                <ProtectedRoute role="instructor">
                  <ClassManager />
                </ProtectedRoute>
              } />
              <Route path="/instructor/students" element={
                <ProtectedRoute role="instructor">
                  <EnrollmentManager />
                </ProtectedRoute>
              } />
              <Route path="/instructor/attendance" element={
                <ProtectedRoute role="instructor">
                  <AttendanceManager />
                </ProtectedRoute>
              } />

              {/* Super Admin Routes */}
              <Route path="/super-admin/dashboard" element={
                <ProtectedRoute role="super_admin">
                  <InstructorManager />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/students" element={
                <ProtectedRoute role="super_admin">
                  <MasterStudentList />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/courses" element={
                <ProtectedRoute role="super_admin">
                  <CourseManager />
                </ProtectedRoute>
              } />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

// Home Selector
const HomeSelector = () => {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Attendance System
        </h1>
        <p className="text-xl text-gray-400">Select your portal to continue</p>
      </div>

      <div className="flex flex-wrap gap-6 justify-center">
        {/* Instructor Portal */}
        <a href="/instructor-login" className="group relative flex h-48 w-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10 hover:shadow-2xl">
          <div className="mb-4 rounded-full bg-blue-500/20 p-4 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">Instructor</h3>
          <p className="mt-2 text-sm text-gray-400">Manage Classes</p>
        </a>

        {/* Student Portal */}
        <a href="/student-login" className="group relative flex h-48 w-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10 hover:shadow-2xl">
          <div className="mb-4 rounded-full bg-purple-500/20 p-4 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">Student</h3>
          <p className="mt-2 text-sm text-gray-400">View Attendance</p>
        </a>

        {/* Super Admin Portal */}
        <a href="/super-admin-login" className="group relative flex h-48 w-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10 hover:shadow-2xl">
          <div className="mb-4 rounded-full bg-red-500/20 p-4 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">Super Admin</h3>
          <p className="mt-2 text-sm text-gray-400">Master Control</p>
        </a>
      </div>
    </div>
  )
}

export default App;
