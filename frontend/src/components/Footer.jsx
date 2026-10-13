import React from 'react';
import { GraduationCap, Heart, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">
              EduBerg India
            </span>
            <span className="text-xs text-slate-400">
              Enterprise ASP.NET Core & React LMS Platform
            </span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-slate-500">
            <span>Powered by ASP.NET Core 9 & EF Core</span>
            <span>•</span>
            <span>SQLite & PostgreSQL Supported</span>
            <span>•</span>
            <span>IIS Ready</span>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} EduBerg India. Built for modern learning.
          </p>
        </div>
      </div>
    </footer>
  );
};
