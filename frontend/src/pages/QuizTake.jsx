import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { quizzesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  HelpCircle, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award,
  AlertCircle
} from 'lucide-react';

export const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useNotification();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizzesApi.getById(id);
        setQuiz(res.data);
        setTimeLeft(res.data.timeLimitMinutes * 60);
      } catch (err) {
        console.error(err);
        error('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const handleSelectOption = (questionId, optionLetter) => {
    if (result) return; // Cannot edit after submission
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      error('Please sign in to submit your quiz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await quizzesApi.submit(id, answers);
      setResult(res.data);

      if (res.data.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        success(`🎉 You passed with ${res.data.score}/${res.data.totalPoints} points (${res.data.percentage}%)!`);
      } else {
        error(`Score: ${res.data.score}/${res.data.totalPoints} (${res.data.percentage}%). Passing score is ${res.data.passingScore}%.`);
      }
    } catch (err) {
      console.error(err);
      error('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    if (quiz) {
      setTimeLeft(quiz.timeLimitMinutes * 60);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!quiz) return null;

  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/courses/${quiz.courseId}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Course
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{quiz.title}</h1>
          <p className="text-xs text-slate-500 mt-1">{quiz.description}</p>
        </div>

        {!result && (
          <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-indigo-900 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>Time Remaining: {formattedTime}</span>
          </div>
        )}
      </div>

      {/* Quiz Result Banner */}
      {result && (
        <div className={`p-6 rounded-2xl border text-center space-y-3 ${
          result.passed 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-white shadow-sm">
            {result.passed ? (
              <Award className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-rose-600" />
            )}
          </div>
          <h2 className="text-2xl font-extrabold">
            {result.passed ? 'Quiz Passed! Excellent Work!' : 'Quiz Completed'}
          </h2>
          <p className="text-sm font-semibold">
            Final Score: <span className="font-bold text-lg">{result.score}</span> / {result.totalPoints} points ({result.percentage}%)
          </p>
          <p className="text-xs opacity-80">
            Passing threshold: {result.passingScore}% • Questions answered: {quiz.questions.length}
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleRetake}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white text-slate-800 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition border"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
            <Link
              to={`/courses/${quiz.courseId}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-indigo-700 transition"
            >
              <span>Back to Course</span>
            </Link>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((q, idx) => {
          const selected = answers[q.id];
          const review = result?.questionReviews?.find((r) => r.questionId === q.id);

          return (
            <div
              key={q.id}
              className={`bg-white p-6 rounded-2xl border transition shadow-xs space-y-4 ${
                review
                  ? review.isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{q.text}</h3>
                </div>

                <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 flex-shrink-0">
                  {q.points} pts
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const optionText = q[`option${letter}`];
                  if (!optionText) return null;

                  const isSelected = selected === letter;
                  let optionClass = 'border-slate-200 hover:border-indigo-300 bg-white text-slate-800';

                  if (result && review) {
                    if (review.correctOption === letter) {
                      optionClass = 'border-emerald-500 bg-emerald-100 text-emerald-950 font-bold';
                    } else if (isSelected && !review.isCorrect) {
                      optionClass = 'border-rose-500 bg-rose-100 text-rose-950 font-bold';
                    }
                  } else if (isSelected) {
                    optionClass = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold';
                  }

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(q.id, letter)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center space-x-3 transition ${optionClass}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {letter}
                      </span>
                      <span className="flex-1">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Review explanation after submission */}
              {review && (
                <div className={`mt-3 p-3.5 rounded-xl text-xs space-y-1 ${
                  review.isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                }`}>
                  <div className="flex items-center space-x-1.5 font-bold">
                    {review.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct! (+{review.pointsEarned} pts)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect. Correct answer was Option {review.correctOption}.</span>
                      </>
                    )}
                  </div>
                  {review.explanation && (
                    <p className="opacity-90 pt-1 border-t border-current/10">
                      <strong>Explanation:</strong> {review.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Bar */}
        {!result && (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Evaluating Answers...' : 'Submit Quiz Now'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
