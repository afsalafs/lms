import React from 'react';

export const ProgressBar = ({ percentage = 0, showLabel = true, size = 'md' }) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  const isComplete = clamped >= 100;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold">
          <span className="text-slate-600">Course Progress</span>
          <span className={isComplete ? 'text-emerald-600 font-bold' : 'text-indigo-600'}>
            {clamped}% {isComplete && '🎉 Completed'}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isComplete ? 'bg-emerald-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
