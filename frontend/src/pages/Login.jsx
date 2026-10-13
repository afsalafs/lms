import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GraduationCap, LogIn, Sparkles, Mail, Lock } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, quickDemoLogin } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (role) => {
    try {
      await quickDemoLogin(role);
      success(`Logged in as ${role}!`);
      navigate('/dashboard');
    } catch (err) {
      error('Demo login failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to EduBerg India</h2>
          <p className="text-xs text-slate-500">Access your courses, modules, live classes, and certificates</p>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>1-Click Demo Evaluation Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('Student')}
              className="py-2 px-1 text-[11px] font-bold bg-white text-slate-800 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl transition shadow-xs"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleDemo('Instructor')}
              className="py-2 px-1 text-[11px] font-bold bg-white text-slate-800 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl transition shadow-xs"
            >
              👨‍🏫 Instructor
            </button>
            <button
              type="button"
              onClick={() => handleDemo('Admin')}
              className="py-2 px-1 text-[11px] font-bold bg-white text-slate-800 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl transition shadow-xs"
            >
              ⚡ Admin
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase font-semibold">Or with email</span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
};
