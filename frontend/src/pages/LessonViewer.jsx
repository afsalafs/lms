import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { coursesApi, lessonsApi, enrollmentsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ProgressBar } from '../components/ProgressBar';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  ChevronRight, 
  ChevronLeft, 
  Award,
  Video,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useNotification();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRes, lessonRes] = await Promise.all([
        coursesApi.getById(courseId),
        lessonsApi.getById(lessonId)
      ]);
      setCourse(courseRes.data);
      setCurrentLesson(lessonRes.data);
      setIsCompleted(lessonRes.data.isCompleted);
    } catch (err) {
      console.error(err);
      error('Failed to load lesson.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, lessonId]);

  const handleToggleComplete = async () => {
    if (!isAuthenticated) {
      error('Please sign in to track progress.');
      return;
    }
    setCompleting(true);
    try {
      const newStatus = !isCompleted;
      const res = await enrollmentsApi.updateProgress(lessonId, newStatus);
      setIsCompleted(newStatus);

      if (res.data.isCourseCompleted) {
        setShowCelebration(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        success('🎉 Congratulations! You have completed the course!');
      } else {
        success(newStatus ? 'Lesson marked as completed!' : 'Lesson marked as incomplete.');
      }

      // Refresh course data for updated progress percentage
      const refreshedCourse = await coursesApi.getById(courseId);
      setCourse(refreshedCourse.data);
    } catch (err) {
      error('Failed to update progress.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!course || !currentLesson) return null;

  // Extract flat list of lessons across all modules
  const lessons = course.modules?.flatMap(m => m.lessons) || course.lessons || [];
  const currentIndex = lessons.findIndex((l) => l.id === parseInt(lessonId));
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center space-x-3 truncate">
          <Link
            to={`/courses/${courseId}`}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Back to Course</span>
          </Link>
          <span className="text-slate-600">|</span>
          <div className="truncate">
            <h1 className="font-bold text-sm text-white truncate">{currentLesson.title}</h1>
            <p className="text-[11px] text-slate-400 truncate">{course.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {course.isUserEnrolled && (
            <button
              onClick={handleToggleComplete}
              disabled={completing}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                isCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Mark as Done</span>
                </>
              )}
            </button>
          )}

          {course.userProgressPercentage >= 100 && (
            <Link
              to={`/certificate/${courseId}`}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition"
            >
              <Award className="w-4 h-4" />
              <span className="hidden md:inline">Certificate</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Video & Content (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video Container */}
          {currentLesson.videoUrl && (
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video w-full flex items-center justify-center">
              <iframe
                src={currentLesson.videoUrl}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Lesson Content Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-xs text-indigo-600 font-bold mb-1">
                <FileText className="w-4 h-4" />
                <span>Lesson {currentIndex + 1} of {lessons.length}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">{currentLesson.title}</h2>
              {currentLesson.description && (
                <p className="text-sm text-slate-500 mt-1">{currentLesson.description}</p>
              )}
            </div>

            {/* Markdown / Content Display */}
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
              {currentLesson.content}
            </div>

            {/* Navigation Bottom Controls */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {prevLesson ? (
                <Link
                  to={`/courses/${courseId}/lessons/${prevLesson.id}`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous: {prevLesson.title}</span>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  to={`/courses/${courseId}/lessons/${nextLesson.id}`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <span>Next: {nextLesson.title}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                course.userProgressPercentage >= 100 && (
                  <Link
                    to={`/certificate/${courseId}`}
                    className="inline-flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                  >
                    <Award className="w-4 h-4" />
                    <span>Claim Certificate</span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right: Curriculum Sidebar (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs sticky top-20">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Course Curriculum</h3>
            
            {course.isUserEnrolled && (
              <div className="mb-4 pb-3 border-b border-slate-100">
                <ProgressBar percentage={course.userProgressPercentage} size="sm" />
              </div>
            )}

            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {lessons.map((l, idx) => {
                const isActive = l.id === parseInt(lessonId);
                const isLessonDone = course.completedLessonIds?.includes(l.id);

                return (
                  <Link
                    key={l.id}
                    to={`/courses/${courseId}/lessons/${l.id}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {isLessonDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="w-4 text-center text-slate-400 font-mono text-[11px] flex-shrink-0">
                          {idx + 1}
                        </span>
                      )}
                      <span className="truncate">{l.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">
                      {l.durationMinutes}m
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
