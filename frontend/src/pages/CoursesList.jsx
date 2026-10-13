import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { coursesApi } from '../api/client';
import { CourseCard } from '../components/CourseCard';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Search, Plus, Filter, BookOpen } from 'lucide-react';

export const CoursesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Modal for creating course
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    price: 0,
    thumbnailUrl: '',
    isPublished: true,
  });

  const { isInstructor, isAdmin } = useAuth();
  const { success, error } = useNotification();

  const loadCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLevel !== 'All') params.level = selectedLevel;

      const [coursesRes, catsRes] = await Promise.all([
        coursesApi.getAll(params),
        coursesApi.getCategories()
      ]);

      setCourses(coursesRes.data);
      setCategories(['All', ...catsRes.data]);
    } catch (err) {
      console.error(err);
      error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCourses();
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await coursesApi.create({
        ...newCourse,
        price: parseFloat(newCourse.price) || 0
      });
      success('Course created successfully!');
      setIsModalOpen(false);
      setNewCourse({
        title: '',
        shortDescription: '',
        description: '',
        category: 'Web Development',
        level: 'Beginner',
        price: 0,
        thumbnailUrl: '',
        isPublished: true,
      });
      loadCourses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Course Catalog
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse interactive courses led by industry experts
          </p>
        </div>

        {(isInstructor || isAdmin) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search courses by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 rounded-lg font-medium transition"
            >
              Search
            </button>
          </form>

          {/* Level Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-4" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No courses found</h3>
          <p className="text-slate-500 text-xs mt-1">
            Try adjusting your search criteria or filter categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedLevel('All');
              loadCourses();
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Full-Stack Development with React & ASP.NET"
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary (1-2 sentences) *</label>
            <input
              type="text"
              required
              placeholder="Brief elevator pitch of what students will learn"
              value={newCourse.shortDescription}
              onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <input
                type="text"
                required
                placeholder="e.g. Web Development"
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Level *</label>
              <select
                value={newCourse.level}
                onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price ($) (0 = Free)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newCourse.price}
                onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newCourse.thumbnailUrl}
              onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Course Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Detailed syllabus and learning outcomes..."
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
