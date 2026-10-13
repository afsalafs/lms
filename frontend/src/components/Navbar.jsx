import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Sparkles,
  User,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isInstructor, logout, quickDemoLogin } = useAuth();
  const { success } = useNotification();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    try {
      await quickDemoLogin(role);
      setDemoMenuOpen(false);
      success(`Switched role to ${role}!`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    success('Logged out successfully.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              EduBerg <span className="text-indigo-600 font-medium">India</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <Link
              to="/courses"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
            >
              Explore Courses
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition flex items-center space-x-1"
              >
                <LayoutDashboard className="w-4 h-4 mr-1 text-slate-500" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition shadow-sm"
                title="Instantly switch demo accounts"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Switch Demo Role</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium animate-fade-in"
                  onMouseLeave={() => setDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Instant Demo Login
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('Student')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between text-slate-700"
                  >
                    <span>🎓 Student (Alex)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Enrolled</span>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('Instructor')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between text-slate-700"
                  >
                    <span>👨‍🏫 Instructor (Alan)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Teacher</span>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('Admin')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between text-slate-700"
                  >
                    <span>⚡ Administrator</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Superuser</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-full hover:ring-2 hover:ring-indigo-300 transition"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] font-semibold text-indigo-600 uppercase">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-sm font-medium animate-fade-in"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 text-xs">
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2 text-slate-400" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition flex items-center"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
