import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  coursesApi, 
  modulesApi,
  lessonsApi, 
  quizzesApi, 
  assignmentsApi, 
  enrollmentsApi, 
  discussionsApi 
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { LiveClassesTab } from '../components/LiveClassesTab';
import { 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Plus, 
  Award,
  Send,
  Trash2,
  Calendar,
  AlertCircle,
  Video,
  Radio,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Hourglass
} from 'lucide-react';

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isInstructor, isAdmin } = useAuth();
  const { success, error, info } = useNotification();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Discussions state
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyParentId, setReplyParentId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Modals state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Forms
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    orderIndex: 1
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    durationMinutes: 15,
    orderIndex: 1,
    isFreePreview: false
  });

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimitMinutes: 15,
    questions: [
      {
        text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: '',
        points: 25
      }
    ]
  });

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    instructions: '',
    maxPoints: 100,
    dueDate: ''
  });

  const loadCourse = async () => {
    try {
      const res = await coursesApi.getById(id);
      setCourse(res.data);
      // Auto-expand all modules initially
      if (res.data.modules) {
        const expanded = {};
        res.data.modules.forEach(m => { expanded[m.id] = true; });
        setExpandedModules(expanded);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  const loadDiscussions = async () => {
    try {
      const res = await discussionsApi.getByCourse(id);
      setDiscussions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCourse();
    loadDiscussions();
  }, [id]);

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      info('Please sign in or select a demo account to apply for enrollment.');
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      const res = await enrollmentsApi.enroll(id);
      success(res.data.message || 'Enrollment request submitted for Admin approval!');
      loadCourse();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to submit enrollment request.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await modulesApi.create(id, newModule);
      success('Module created successfully!');
      setIsModuleModalOpen(false);
      setNewModule({ title: '', description: '', orderIndex: (course.modules?.length || 0) + 1 });
      loadCourse();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create module.');
    }
  };

  const handleOpenAddLesson = (moduleId) => {
    setTargetModuleId(moduleId);
    const mod = course.modules?.find(m => m.id === moduleId);
    setNewLesson({
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      durationMinutes: 15,
      orderIndex: (mod?.lessons?.length || 0) + 1,
      isFreePreview: false
    });
    setIsLessonModalOpen(true);
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!targetModuleId) return;
    try {
      await lessonsApi.create(targetModuleId, newLesson);
      success('Lesson added to module successfully!');
      setIsLessonModalOpen(false);
      loadCourse();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add lesson.');
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await quizzesApi.create(id, newQuiz);
      success('Quiz created successfully!');
      setIsQuizModalOpen(false);
      loadCourse();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create quiz.');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await assignmentsApi.create(id, {
        ...newAssignment,
        dueDate: newAssignment.dueDate ? new Date(newAssignment.dueDate).toISOString() : null
      });
      success('Assignment added successfully!');
      setIsAssignmentModalOpen(false);
      loadCourse();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add assignment.');
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      info('Please sign in to participate in discussions.');
      return;
    }
    if (!newComment.trim()) return;

    try {
      await discussionsApi.create(id, { content: newComment });
      setNewComment('');
      loadDiscussions();
      success('Comment posted!');
    } catch (err) {
      error('Failed to post discussion.');
    }
  };

  const handlePostReply = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      await discussionsApi.create(id, { content: replyText, parentId });
      setReplyText('');
      setReplyParentId(null);
      loadDiscussions();
      success('Reply posted!');
    } catch (err) {
      error('Failed to post reply.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 rounded w-2/3" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Course Not Found</h2>
        <p className="text-slate-500 text-xs mt-1">This course may have been removed.</p>
        <Link to="/courses" className="mt-4 inline-block text-xs font-bold text-indigo-600">
          Back to Courses
        </Link>
      </div>
    );
  }

  const isInstructorOrAdmin = isAdmin || (isInstructor && course.instructorId === user?.id);
  const isEnrolled = course.isUserEnrolled; // true only if Approved
  const enrollmentStatus = course.enrollmentStatus; // None, Pending, Approved, Rejected
  const isCompleted = course.userProgressPercentage >= 100;

  // Flatten all lessons across modules for quick counts
  const allLessons = course.modules?.flatMap(m => m.lessons) || [];

  return (
    <div className="pb-20">
      {/* Course Banner Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Left info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full">
                  {course.category}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {course.level} Level
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400">
                  {course.modules?.length || 0} Modules • {allLessons.length} Lessons
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {course.shortDescription || course.description}
              </p>

              {/* Instructor Info */}
              <div className="flex items-center space-x-3 pt-2">
                <img
                  src={course.instructorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.instructorName)}`}
                  alt={course.instructorName}
                  className="w-10 h-10 rounded-full border border-indigo-400 object-cover"
                />
                <div>
                  <p className="text-xs text-slate-400">Course Instructor</p>
                  <p className="text-sm font-bold text-white">{course.instructorName}</p>
                </div>
              </div>
            </div>

            {/* Sticky Action Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col justify-between">
              <div className="relative h-44 rounded-2xl overflow-hidden mb-5 bg-slate-100">
                <img
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {course.enrolledStudentsCount} approved students
                  </span>
                </div>

                {isEnrolled && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <ProgressBar percentage={course.userProgressPercentage} size="md" />
                    {isCompleted && (
                      <Link
                        to={`/certificate/${course.id}`}
                        className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition"
                      >
                        <Award className="w-4 h-4" />
                        <span>View Verified Certificate</span>
                      </Link>
                    )}
                  </div>
                )}

                {/* Enrollment status buttons */}
                {isEnrolled ? (
                  <Link
                    to={allLessons.length > 0 ? `/courses/${course.id}/lessons/${allLessons[0].id}` : '#'}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>{isCompleted ? 'Review Lessons' : 'Continue Learning'}</span>
                  </Link>
                ) : enrollmentStatus === 'Pending' ? (
                  <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1">
                    <div className="flex items-center justify-center space-x-1 text-xs font-bold text-amber-800">
                      <Hourglass className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Enrollment Awaiting Admin Approval</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Your admission request is being reviewed by the academy admin. Once approved, class materials will unlock automatically.
                    </p>
                  </div>
                ) : enrollmentStatus === 'Rejected' ? (
                  <div className="w-full p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-rose-700">Enrollment Application Rejected</p>
                    <p className="text-[11px] text-rose-600 mt-0.5">Please contact support or apply again later.</p>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{enrolling ? 'Submitting Application...' : 'Apply for Enrollment'}</span>
                  </button>
                )}

                <div className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Modules</span>
                    <span className="font-semibold text-slate-700">{course.modules?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Lessons</span>
                    <span className="font-semibold text-slate-700">{allLessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="font-semibold text-slate-700">{course.totalDurationMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quizzes</span>
                    <span className="font-semibold text-slate-700">{course.quizzes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificate</span>
                    <span className="font-semibold text-emerald-600">EduBerg Verified</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 ${
                activeTab === 'curriculum'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Modules & Lessons ({allLessons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 ${
                activeTab === 'quizzes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Quizzes ({course.quizzes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 ${
                activeTab === 'assignments'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Assignments ({course.assignments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('discussions')}
              className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 ${
                activeTab === 'discussions'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussions ({discussions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center space-x-2 ${
                activeTab === 'live'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Radio className="w-4 h-4 text-rose-500" />
              <span>Live Classes (Zoom Auto-Link)</span>
            </button>
          </nav>
        </div>

        {/* Tab: Live Classes (Zoom) */}
        {activeTab === 'live' && (
          <LiveClassesTab
            courseId={course.id}
            isInstructorOrAdmin={isInstructorOrAdmin}
            isEnrolled={isEnrolled}
          />
        )}

        {/* Tab 1: Curriculum with Modules & Lessons */}
        {activeTab === 'curriculum' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Course Curriculum Hierarchy</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Organized into Modules, with structured Lessons under each Module
                </p>
              </div>

              {isInstructorOrAdmin && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsModuleModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-indigo-200"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Add New Module</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modules Accordion List */}
            <div className="space-y-4">
              {course.modules?.map((module, modIdx) => {
                const isExpanded = expandedModules[module.id] ?? true;
                const completedInModule = module.lessons?.filter(l => course.completedLessonIds?.includes(l.id)).length || 0;

                return (
                  <div
                    key={module.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                  >
                    {/* Module Header Bar */}
                    <div
                      onClick={() => toggleModule(module.id)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100 cursor-pointer flex items-center justify-between transition border-b border-slate-200"
                    >
                      <div className="flex items-center space-x-3">
                        <button className="text-slate-400">
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {modIdx + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                            <span>{module.title}</span>
                          </h3>
                          {module.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-semibold text-slate-500">
                          {completedInModule} / {module.lessons?.length || 0} completed
                        </span>
                        {isInstructorOrAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddLesson(module.id);
                            }}
                            className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Lesson</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lessons inside Module */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100">
                        {module.lessons?.map((lesson, lessonIdx) => {
                          const canAccess = isEnrolled || lesson.isFreePreview || isInstructorOrAdmin;
                          const isLessonDone = course.completedLessonIds?.includes(lesson.id);

                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-4 pl-12 hover:bg-indigo-50/30 transition"
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isLessonDone
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {isLessonDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : `${modIdx + 1}.${lessonIdx + 1}`}
                                </div>

                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-bold text-slate-900 text-sm">
                                      {lesson.title}
                                    </h4>
                                    {lesson.isFreePreview && (
                                      <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                                        Free Preview
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {lesson.description || 'Hands-on lesson notes & content'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1 text-xs text-slate-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{lesson.durationMinutes}m</span>
                                </div>

                                {canAccess ? (
                                  <Link
                                    to={`/courses/${course.id}/lessons/${lesson.id}`}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    <span>{isLessonDone ? 'Review' : 'Start'}</span>
                                  </Link>
                                ) : (
                                  <div className="flex items-center space-x-1 text-xs text-slate-400 px-3 py-1.5 bg-slate-100 rounded-lg">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Locked</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {(!module.lessons || module.lessons.length === 0) && (
                          <div className="p-6 text-center text-slate-400 text-xs">
                            No lessons added to this module yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {(!course.modules || course.modules.length === 0) && (
                <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-dashed border-slate-300">
                  No modules or lessons have been added to this course yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Knowledge Check Quizzes</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Test your skills with multiple-choice questions
                </p>
              </div>

              {isInstructorOrAdmin && (
                <button
                  onClick={() => setIsQuizModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Quiz</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {quiz.questionCount} Questions • {quiz.totalPoints} pts
                      </span>
                      {quiz.hasAttempted && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          quiz.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {quiz.passed ? 'Passed' : 'Needs Practice'} (Best: {quiz.bestScore} pts)
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mt-3">{quiz.title}</h3>
                    <p className="text-slate-600 text-xs mt-1">{quiz.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Time limit: {quiz.timeLimitMinutes}m • Pass: {quiz.passingScore}%
                    </span>

                    {isEnrolled || isInstructorOrAdmin ? (
                      <Link
                        to={`/quizzes/${quiz.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                      >
                        {quiz.hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400 flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1" /> Enroll to unlock
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {course.quizzes.length === 0 && (
                <div className="col-span-2 p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-dashed border-slate-300">
                  No quizzes have been created for this course yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Assignments */}
        {activeTab === 'assignments' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Practical Assignments</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Submit code and projects for instructor review and grading
                </p>
              </div>

              {isInstructorOrAdmin && (
                <button
                  onClick={() => setIsAssignmentModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Assignment</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {course.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-900 text-base">{assignment.title}</h3>
                      {assignment.hasSubmitted && (
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Submitted
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs mt-1 max-w-2xl line-clamp-2">
                      {assignment.instructions}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <span>Max Points: {assignment.maxPoints}</span>
                      {assignment.dueDate && (
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {assignment.myGrade !== null && assignment.myGrade !== undefined && (
                        <span className="font-bold text-indigo-600">
                          Grade: {assignment.myGrade} / {assignment.maxPoints}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {isEnrolled || isInstructorOrAdmin ? (
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition inline-block text-center"
                      >
                        {isInstructorOrAdmin
                          ? `Review Submissions (${assignment.totalSubmissions})`
                          : assignment.hasSubmitted
                          ? 'View Feedback'
                          : 'Submit Solution'}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400 flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1" /> Enroll to submit
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {course.assignments.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-dashed border-slate-300">
                  No assignments have been assigned yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Discussions */}
        {activeTab === 'discussions' && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Course Q&A & Community</h2>

            <form onSubmit={handlePostDiscussion} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <textarea
                rows={3}
                placeholder="Ask a question or start a discussion topic with classmates and instructors..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Question</span>
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {discussions.map((d) => (
                <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={d.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(d.userName)}`}
                        alt={d.userName}
                        className="w-7 h-7 rounded-full object-cover border"
                      />
                      <span className="font-bold text-sm text-slate-900">{d.userName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold uppercase">
                        {d.userRole}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{d.content}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <button
                      onClick={() => setReplyParentId(replyParentId === d.id ? null : d.id)}
                      className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      {replyParentId === d.id ? 'Cancel Reply' : `Reply (${d.replies?.length || 0})`}
                    </button>
                  </div>

                  {replyParentId === d.id && (
                    <div className="pt-2 flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Write a response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg"
                      />
                      <button
                        onClick={() => handlePostReply(d.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
                      >
                        Reply
                      </button>
                    </div>
                  )}

                  {d.replies && d.replies.length > 0 && (
                    <div className="pl-6 space-y-2 border-l-2 border-indigo-100 mt-2">
                      {d.replies.map((reply) => (
                        <div key={reply.id} className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{reply.userName}</span>
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-semibold uppercase">
                              {reply.userRole}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-700">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal: Add Module */}
      <Modal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        title="Add New Course Module"
      >
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Module Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Module 1: Foundations & Architecture"
              value={newModule.title}
              onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Module Description</label>
            <textarea
              rows={2}
              placeholder="What topics or competencies are covered in this module?"
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
            <input
              type="number"
              min="1"
              value={newModule.orderIndex}
              onChange={(e) => setNewModule({ ...newModule, orderIndex: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 text-sm border rounded-xl"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModuleModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              Create Module
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Lesson to Module */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title="Add New Lesson to Module"
      >
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Introduction to REST APIs"
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={newLesson.durationMinutes}
                onChange={(e) => setNewLesson({ ...newLesson, durationMinutes: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Video Embed URL (optional)</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/embed/..."
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
            <input
              type="text"
              placeholder="Quick one-line summary of this lesson"
              value={newLesson.description}
              onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Content / Notes (Markdown) *</label>
            <textarea
              required
              rows={6}
              placeholder="# Lecture Notes..."
              value={newLesson.content}
              onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFreePreview"
              checked={newLesson.isFreePreview}
              onChange={(e) => setNewLesson({ ...newLesson, isFreePreview: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isFreePreview" className="text-xs font-medium text-slate-700">
              Allow free preview (accessible without approved enrollment)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsLessonModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              Save Lesson
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Quiz */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title="Create Knowledge Quiz"
      >
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm Knowledge Check"
              value={newQuiz.title}
              onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Score (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newQuiz.passingScore}
                onChange={(e) => setNewQuiz({ ...newQuiz, passingScore: parseInt(e.target.value) || 70 })}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Limit (mins)</label>
              <input
                type="number"
                min="1"
                value={newQuiz.timeLimitMinutes}
                onChange={(e) => setNewQuiz({ ...newQuiz, timeLimitMinutes: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Description</label>
            <input
              type="text"
              placeholder="Brief instructions for the student"
              value={newQuiz.description}
              onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsQuizModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              Create Quiz
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Assignment */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Add Assignment"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Build an EF Core Repository"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Points</label>
              <input
                type="number"
                min="10"
                value={newAssignment.maxPoints}
                onChange={(e) => setNewAssignment({ ...newAssignment, maxPoints: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date (optional)</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instructions & Guidelines *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe what the student should build, deliver, and submission requirements..."
              value={newAssignment.instructions}
              onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAssignmentModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              Add Assignment
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
