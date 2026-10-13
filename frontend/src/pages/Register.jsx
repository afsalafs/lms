import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GraduationCap, UserPlus, Mail, Lock, User, Briefcase, Clock, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedPending, setSubmittedPending] = useState(false);

  const { register } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await register(name, email, password, role, bio);
      if (res.accountStatus === 'Pending') {
        setSubmittedPending(true);
        success('Registration submitted! Awaiting administrator approval.');
      } else {
        success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed. Email might already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedPending) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Registration Pending Approval</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Thank you for registering with <strong>EduBerg India</strong>! In accordance with academy policy, your student profile must be validated and approved by the system administrator before your account is activated.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 text-left space-y-2">
            <div className="flex items-center font-bold">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mr-1.5" />
              <span>Next Steps:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-700 pl-1">
              <li>An administrator will review your application.</li>
              <li>Once approved, you will be authorized to log in and apply for course enrollments.</li>
              <li>You can check your status anytime by attempting to sign in.</li>
            </ul>
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              className="w-full inline-block py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Join EduBerg India</h2>
          <p className="text-xs text-slate-500">Register to request admission and access interactive courses</p>
        </div>

        {/* Notice on Approval */}
        <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs text-indigo-800 flex items-start space-x-2">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>New student registrations are reviewed & approved by the Admin before course access is granted.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Afsal Rahiman"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="afsal@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password * (min 6 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">I am registering as *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Student')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1.5 transition ${
                  role === 'Student'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🎓 Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('Instructor')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1.5 transition ${
                  role === 'Instructor'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👨‍🏫 Instructor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brief Bio or Background</label>
            <textarea
              rows={2}
              placeholder="Tell us a little about your learning goals or experience..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{submitting ? 'Submitting Registration...' : 'Submit Registration for Approval'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an approved account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};
