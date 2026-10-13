import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

export const CourseCard = ({ course, isEnrolled, progressPercentage = 0 }) => {
  const isComplete = progressPercentage >= 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 flex flex-col h-full group">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold bg-white/90 backdrop-blur rounded-full text-indigo-700 shadow-sm">
            {course.category}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-900/80 backdrop-blur rounded-full text-white shadow-sm">
            {course.level}
          </span>
        </div>
        {isComplete && (
          <div className="absolute bottom-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition">
            {course.title}
          </h3>
          <p className="text-slate-600 text-xs mt-2 line-clamp-2">
            {course.shortDescription || course.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.totalDurationMinutes || 60}m</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.totalLessons || 0} Lessons</span>
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {course.price === 0 ? (
                <span className="text-emerald-600">Free</span>
              ) : (
                `$${course.price}`
              )}
            </div>
          </div>

          {/* Instructor & Action */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <img
                src={course.instructorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.instructorName || 'Instructor')}`}
                alt={course.instructorName}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                {course.instructorName}
              </span>
            </div>

            <Link
              to={`/courses/${course.id}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                isEnrolled
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
            >
              {isEnrolled ? (isComplete ? 'Review' : 'Continue') : 'View Course'}
            </Link>
          </div>

          {/* If enrolled, show progress */}
          {isEnrolled && (
            <div className="mt-3">
              <ProgressBar percentage={progressPercentage} size="sm" showLabel={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
