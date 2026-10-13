import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesApi } from '../api/client';
import { CourseCard } from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  CheckCircle, 
  Award, 
  BookOpen, 
  FileCheck2, 
  MessageSquare,
  Users,
  ShieldCheck
} from 'lucide-react';

export const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await coursesApi.getAll();
        setCourses(res.data.slice(0, 4)); // Show first 4
      } catch (err) {
        console.error('Failed to fetch featured courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/courses');
    }
  };

  const handleDemo = async (role) => {
    await quickDemoLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white py-16 lg:py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>EduBerg India • Enterprise Learning Management System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Master In-Demand Skills with <span className="text-indigo-600">Interactive Courses</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, full-stack educational platform built with ASP.NET Core Web API, EF Core, and React. Track progress, take quizzes, complete assignments, and earn verifiable certificates.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex items-center bg-white p-2 rounded-2xl shadow-lg border border-slate-200">
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Search by course title or topic (e.g. React, ASP.NET, PostgreSQL)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-sm flex items-center"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Quick Demo Credentials Banner */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="text-slate-500 font-medium">Quick 1-Click Evaluation:</span>
            <button
              onClick={() => handleDemo('Student')}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-indigo-500 hover:text-indigo-600 font-semibold shadow-xs transition"
            >
              🎓 Login as Student
            </button>
            <button
              onClick={() => handleDemo('Instructor')}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-indigo-500 hover:text-indigo-600 font-semibold shadow-xs transition"
            >
              👨‍🏫 Login as Instructor
            </button>
            <button
              onClick={() => handleDemo('Admin')}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-indigo-500 hover:text-indigo-600 font-semibold shadow-xs transition"
            >
              ⚡ Login as Admin
            </button>
          </div>

        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Structured Lessons</h3>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Step-by-step curriculum with rich markdown notes, video lectures, and live code examples.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Timed Quizzes</h3>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Assess your understanding with automated scoring, question timers, and detailed explanations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Assignments & Grading</h3>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Submit hands-on projects, get graded by instructors, and receive personalized feedback.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Verified Certificates</h3>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Earn shareable, printable certificates of achievement upon 100% course completion.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Courses</h2>
            <p className="text-slate-600 text-sm mt-1">Explore our top-rated hands-on courses</p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Browse All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to start your learning journey?
            </h2>
            <p className="mt-3 text-indigo-100 text-sm leading-relaxed">
              Join thousands of students and developers mastering full-stack software development, database design, and cloud infrastructure.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition shadow-md text-sm"
            >
              Explore Catalog
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-500 transition border border-indigo-400 text-sm"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
