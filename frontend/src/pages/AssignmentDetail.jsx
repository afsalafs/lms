import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Send, 
  CheckCircle2, 
  Award, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';

export const AssignmentDetail = () => {
  const { id } = useParams();
  const { user, isInstructor, isAdmin } = useAuth();
  const { success, error } = useNotification();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student submission form
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Instructor grading state: submissionId -> { grade, feedback }
  const [gradingState, setGradingState] = useState({});

  const loadAssignment = async () => {
    try {
      const res = await assignmentsApi.getById(id);
      setAssignment(res.data);
    } catch (err) {
      console.error(err);
      error('Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await assignmentsApi.submit(id, { submissionText, attachmentUrl });
      success('Assignment submitted successfully!');
      setSubmissionText('');
      setAttachmentUrl('');
      loadAssignment();
    } catch (err) {
      console.error(err);
      error('Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    const data = gradingState[submissionId];
    if (!data || data.grade === undefined) {
      error('Please enter a grade score.');
      return;
    }
    try {
      await assignmentsApi.grade(submissionId, {
        grade: parseInt(data.grade),
        feedback: data.feedback || ''
      });
      success('Submission graded successfully!');
      loadAssignment();
    } catch (err) {
      console.error(err);
      error('Failed to save grade.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!assignment) return null;

  const isInstructorOrAdmin = isInstructor || isAdmin;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          to={`/courses/${assignment.courseId}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Course
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {assignment.title}
          </h1>
          <div className="flex items-center space-x-3 text-xs">
            <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-200">
              Max Points: {assignment.maxPoints}
            </span>
            {assignment.dueDate && (
              <span className="flex items-center text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center">
          <FileText className="w-4 h-4 mr-1.5 text-indigo-600" />
          Assignment Prompt & Deliverables
        </h3>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {assignment.instructions}
        </p>
      </div>

      {/* Student View: My Submission / Feedback */}
      {!isInstructorOrAdmin && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Submission</h3>
            {assignment.hasSubmitted && (
              <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                Submitted on {new Date(assignment.mySubmittedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Graded Card */}
          {assignment.myGrade !== null && assignment.myGrade !== undefined ? (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase">Graded Result</span>
                <span className="text-lg font-black text-emerald-900">
                  {assignment.myGrade} / {assignment.maxPoints} pts
                </span>
              </div>
              {assignment.myFeedback && (
                <div className="pt-2 border-t border-emerald-200/60 text-xs text-emerald-800">
                  <p className="font-bold mb-1">Instructor Feedback:</p>
                  <p>{assignment.myFeedback}</p>
                </div>
              )}
            </div>
          ) : assignment.hasSubmitted ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
              ⏳ Your submission has been received and is waiting for instructor review and grading.
            </div>
          ) : null}

          {/* Submission Form */}
          <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Solution / Code / Explanation *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Paste your solution details, code explanation, or project description..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="w-full p-3 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Repository Link or Live Demo URL (optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/your-username/project..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{assignment.hasSubmitted ? 'Resubmit Solution' : 'Submit Assignment'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Instructor / Admin View: Review Student Submissions */}
      {isInstructorOrAdmin && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-indigo-600" />
            Student Submissions ({assignment.submissions?.length || 0})
          </h2>

          <div className="space-y-4">
            {assignment.submissions && assignment.submissions.length > 0 ? (
              assignment.submissions.map((sub) => {
                const currentGrade = gradingState[sub.id]?.grade ?? sub.grade ?? '';
                const currentFeedback = gradingState[sub.id]?.feedback ?? sub.feedback ?? '';

                return (
                  <div
                    key={sub.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{sub.studentName}</h4>
                        <p className="text-xs text-slate-500">{sub.studentEmail}</p>
                      </div>
                      <div className="text-xs text-slate-400">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-600">Student Response:</p>
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 font-mono whitespace-pre-wrap">
                        {sub.submissionText}
                      </div>

                      {sub.attachmentUrl && (
                        <a
                          href={sub.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          View Attachment / External URL
                        </a>
                      )}
                    </div>

                    {/* Grading Controls */}
                    <div className="pt-3 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-full sm:w-44">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Grade (out of {assignment.maxPoints})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={assignment.maxPoints}
                            value={currentGrade}
                            onChange={(e) =>
                              setGradingState((prev) => ({
                                ...prev,
                                [sub.id]: { ...prev[sub.id], grade: e.target.value }
                              }))
                            }
                            placeholder="e.g. 95"
                            className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg"
                          />
                        </div>

                        <div className="flex-1 w-full">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Feedback for Student
                          </label>
                          <input
                            type="text"
                            value={currentFeedback}
                            onChange={(e) =>
                              setGradingState((prev) => ({
                                ...prev,
                                [sub.id]: { ...prev[sub.id], feedback: e.target.value }
                              }))
                            }
                            placeholder="Great work on clean architecture..."
                            className="w-full px-3 py-1.5 text-xs bg-white border rounded-lg"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleGradeSubmission(sub.id)}
                          className="w-full sm:w-auto mt-4 sm:mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs transition"
                        >
                          Save Grade
                        </button>
                      </div>

                      {sub.grade !== null && (
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          ✓ Graded: {sub.grade}/{assignment.maxPoints} pts
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-dashed border-slate-300">
                No students have submitted this assignment yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
