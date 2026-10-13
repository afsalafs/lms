import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, enrollmentsApi, authApi, liveClassesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ProgressBar } from '../components/ProgressBar';
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Award, 
  Users, 
  FileCheck2, 
  TrendingUp, 
  Clock, 
  Plus, 
  Trash2, 
  ShieldCheck,
  PlayCircle,
  Video,
  Radio,
  ExternalLink,
  Calendar,
  UserCheck,
  UserX,
  Hourglass,
  Check,
  X
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isStudent, isInstructor, isAdmin } = useAuth();
  const { success, error } = useNotification();

  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState(null);
  const [instructorStats, setInstructorStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [upcomingLive, setUpcomingLive] = useState([]);
  const [adminTab, setAdminTab] = useState('overview'); // overview, registrations, enrollments, users

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [adminRes, usersRes, enrollRes] = await Promise.all([
          analyticsApi.getAdminStats(),
          authApi.getUsers(),
          enrollmentsApi.getAll()
        ]);
        setAdminStats(adminRes.data);
        setAllUsers(usersRes.data);
        setAllEnrollments(enrollRes.data);
      } else if (isInstructor) {
        const res = await analyticsApi.getInstructorStats();
        setInstructorStats(res.data);
      } else {
        const res = await analyticsApi.getStudentStats();
        setStudentStats(res.data);
      }

      // Fetch upcoming live classes
      const liveRes = await liveClassesApi.getUpcoming();
      setUpcomingLive(liveRes.data);
    } catch (err) {
      console.error(err);
      error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  // Admin approval handlers
  const handleApproveUser = async (userId, newStatus) => {
    try {
      await authApi.updateUserStatus(userId, newStatus);
      success(`User status updated to ${newStatus}!`);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: newStatus } : u));
      // Reload stats
      const statRes = await analyticsApi.getAdminStats();
      setAdminStats(statRes.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleApproveEnrollment = async (enrollmentId, newStatus) => {
    try {
      await enrollmentsApi.updateStatus(enrollmentId, newStatus);
      success(`Enrollment status updated to ${newStatus}!`);
      setAllEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: newStatus } : e));
      const statRes = await analyticsApi.getAdminStats();
      setAdminStats(statRes.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update enrollment status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await authApi.deleteUser(userId);
      success('User deleted.');
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      error('Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const pendingUsers = allUsers.filter(u => u.accountStatus === 'Pending');
  const pendingEnrollments = allEnrollments.filter(e => e.status === 'Pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-14 h-14 rounded-2xl border-2 border-indigo-500 object-cover shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome, {user?.name}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-indigo-100 text-indigo-700">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              EduBerg India • Enterprise Learning Management System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-purple-600" /> System Administrator
            </span>
          )}
          <Link
            to="/courses"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Explore Courses
          </Link>
        </div>
      </div>

      {/* STUDENT DASHBOARD */}
      {user?.role === 'Student' && studentStats && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Enrolled Courses</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{studentStats.enrolledCoursesCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">In Progress</p>
                <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{studentStats.inProgressCoursesCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Completed Courses</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{studentStats.completedCoursesCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Certificates Earned</p>
                <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{studentStats.certificatesEarned}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Live Zoom Sessions Alert Widget */}
          {upcomingLive.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <h3 className="font-extrabold text-base tracking-tight">Live Zoom Workshops & Virtual Classes</h3>
                </div>
                <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-indigo-200 font-semibold">
                  {upcomingLive.length} active sessions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingLive.map((live) => (
                  <div key={live.id} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-indigo-300 uppercase tracking-wider">{live.courseTitle}</span>
                        {live.status === 'Live' ? (
                          <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                            🔴 LIVE NOW
                          </span>
                        ) : (
                          <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                            Scheduled
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white">{live.title}</h4>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{live.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-slate-400">
                        {new Date(live.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {live.durationMinutes}m
                      </span>
                      <a
                        href={live.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join on {live.platform}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enrolled Courses Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">My Learning Courses</h2>

            {studentStats.recentCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentStats.recentCourses.map((e) => {
                  const isDone = e.progressPercentage >= 100;
                  const isApproved = e.status === 'Approved';

                  return (
                    <div
                      key={e.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
                    >
                      <div className="relative h-36 bg-slate-100">
                        <img
                          src={e.courseThumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                          alt={e.courseTitle}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-white/90 text-indigo-700 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                          {e.category}
                        </span>
                        <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs ${
                          isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 line-clamp-1">{e.courseTitle}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Instructor: {e.instructorName}</p>
                        </div>

                        {isApproved ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-slate-600">
                              <span>Progress</span>
                              <span>{e.progressPercentage}%</span>
                            </div>
                            <ProgressBar percentage={e.progressPercentage} size="sm" />
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-50 rounded-lg text-[11px] text-amber-700 font-medium">
                            ⏳ Enrollment awaits Admin review. Once validated, course modules will unlock.
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          {isApproved ? (
                            <>
                              <Link
                                to={`/courses/${e.courseId}`}
                                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                <PlayCircle className="w-4 h-4 mr-1" />
                                <span>{isDone ? 'Review' : 'Continue'}</span>
                              </Link>
                              {isDone && (
                                <Link
                                  to={`/certificate/${e.courseId}`}
                                  className="font-bold text-emerald-600 hover:text-emerald-800 flex items-center"
                                >
                                  <Award className="w-4 h-4 mr-1" />
                                  <span>Certificate</span>
                                </Link>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 italic">Access pending approval</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">You are not enrolled in any courses yet</h3>
                <Link
                  to="/courses"
                  className="inline-block bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Browse Course Catalog
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSTRUCTOR DASHBOARD */}
      {isInstructor && instructorStats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold">Courses Created</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{instructorStats.totalCoursesTaught}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold">Enrolled Students</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{instructorStats.totalEnrolledStudents}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold">Submissions to Grade</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{instructorStats.pendingAssignmentsToGrade}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Your Instructed Courses</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Course Title</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Lessons</th>
                    <th className="py-3 px-4">Quizzes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instructorStats.courses.map((c) => (
                    <tr key={c.courseId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-5 font-bold text-slate-800">{c.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{c.studentCount}</td>
                      <td className="py-3.5 px-4 text-slate-600">{c.lessonCount}</td>
                      <td className="py-3.5 px-4 text-slate-600">{c.quizCount}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Published
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          to={`/courses/${c.courseId}`}
                          className="font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg"
                        >
                          Manage Modules & Content
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD WITH APPROVAL TABS */}
      {isAdmin && adminStats && (
        <div className="space-y-8">
          
          {/* Admin Navigation Tabs */}
          <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
            <button
              onClick={() => setAdminTab('overview')}
              className={`pb-3 border-b-2 transition ${
                adminTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview & Metrics
            </button>
            <button
              onClick={() => setAdminTab('registrations')}
              className={`pb-3 border-b-2 transition flex items-center space-x-1.5 ${
                adminTab === 'registrations'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Student Registrations</span>
              {pendingUsers.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {pendingUsers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAdminTab('enrollments')}
              className={`pb-3 border-b-2 transition flex items-center space-x-1.5 ${
                adminTab === 'enrollments'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Course Enrollment Requests</span>
              {pendingEnrollments.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {pendingEnrollments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAdminTab('users')}
              className={`pb-3 border-b-2 transition ${
                adminTab === 'users'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All User Directory ({allUsers.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {adminTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-semibold">Total Students</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{adminStats.totalStudents}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-semibold">Instructors</p>
                  <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{adminStats.totalInstructors}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-semibold">Courses</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{adminStats.totalCourses}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-semibold">Active Enrollments</p>
                  <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{adminStats.totalEnrollments}</h3>
                </div>
              </div>

              {/* Approval Alerts Banner */}
              {(pendingUsers.length > 0 || pendingEnrollments.length > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Hourglass className="w-6 h-6 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-900">Items Requiring Administrator Approval</h4>
                      <p className="text-xs text-amber-700">
                        {pendingUsers.length} student registrations and {pendingEnrollments.length} course enrollment requests are pending validation.
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {pendingUsers.length > 0 && (
                      <button
                        onClick={() => setAdminTab('registrations')}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Review Registrations ({pendingUsers.length})
                      </button>
                    )}
                    {pendingEnrollments.length > 0 && (
                      <button
                        onClick={() => setAdminTab('enrollments')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Review Enrollments ({pendingEnrollments.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING STUDENT REGISTRATIONS */}
          {adminTab === 'registrations' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-indigo-600" />
                    Student Registration Approval Queue
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Newly registered accounts must be approved by the admin before they are allowed to log in and attend classes.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Student</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Registration Status</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-5 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-5 flex items-center space-x-2.5">
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">{u.name}</span>
                            {u.bio && <span className="text-[11px] text-slate-400 line-clamp-1">{u.bio}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{u.role}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.accountStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.accountStatus === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {u.accountStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-5 text-right">
                          {u.role !== 'Admin' && (
                            <div className="flex items-center justify-end space-x-2">
                              {u.accountStatus !== 'Approved' && (
                                <button
                                  onClick={() => handleApproveUser(u.id, 'Approved')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1 transition shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}
                              {u.accountStatus !== 'Rejected' && (
                                <button
                                  onClick={() => handleApproveUser(u.id, 'Rejected')}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1 transition border border-rose-200"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COURSE ENROLLMENT REQUESTS */}
          {adminTab === 'enrollments' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center">
                    <FileCheck2 className="w-5 h-5 mr-2 text-indigo-600" />
                    Course Enrollment & Admission Approvals
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Course access and class admission is strictly granted upon administrator validation.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Student</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4">Application Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allEnrollments.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-5 font-bold text-slate-800">
                          {e.studentName || 'Alex Johnson'}
                          <span className="text-[11px] text-slate-400 block font-normal">{e.studentEmail}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{e.courseTitle}</td>
                        <td className="py-3 px-4 text-slate-500">{e.instructorName}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(e.enrolledAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            e.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : e.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {e.status !== 'Approved' && (
                              <button
                                onClick={() => handleApproveEnrollment(e.id, 'Approved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1 transition shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Admit to Course</span>
                              </button>
                            )}
                            {e.status !== 'Rejected' && (
                              <button
                                onClick={() => handleApproveEnrollment(e.id, 'Rejected')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1 transition border border-rose-200"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allEnrollments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                          No enrollment applications submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ALL USERS DIRECTORY */}
          {adminTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-600" />
                  All System Accounts ({allUsers.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-5 flex items-center space-x-2.5">
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <span className="font-bold text-slate-800">{u.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'Admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : u.role === 'Instructor' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{u.accountStatus || 'Approved'}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-5 text-right">
                          {u.role !== 'Admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
