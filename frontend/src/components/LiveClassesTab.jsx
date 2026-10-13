import React, { useState, useEffect } from 'react';
import { liveClassesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Modal } from './Modal';
import { 
  Radio, 
  Video, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Copy, 
  Plus, 
  Play, 
  CheckCircle2, 
  Trash2, 
  Key, 
  Hash, 
  Users,
  Tv
} from 'lucide-react';

export const LiveClassesTab = ({ courseId, isInstructorOrAdmin, isEnrolled }) => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeRecording, setActiveRecording] = useState(null);

  const { success, error, info } = useNotification();

  const [form, setForm] = useState({
    title: '',
    description: '',
    platform: 'Zoom',
    joinUrl: '',
    meetingId: '',
    passcode: '',
    scheduledStartTime: '',
    durationMinutes: 60,
    recordingUrl: ''
  });

  const loadLiveClasses = async () => {
    try {
      const res = await liveClassesApi.getByCourse(courseId);
      setLiveClasses(res.data);
    } catch (err) {
      console.error(err);
      error('Failed to load live sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveClasses();
  }, [courseId]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await liveClassesApi.schedule(courseId, {
        ...form,
        scheduledStartTime: new Date(form.scheduledStartTime).toISOString()
      });
      success('Live class scheduled successfully!');
      setIsModalOpen(false);
      setForm({
        title: '',
        description: '',
        platform: 'Zoom',
        joinUrl: '',
        meetingId: '',
        passcode: '',
        scheduledStartTime: '',
        durationMinutes: 60,
        recordingUrl: ''
      });
      loadLiveClasses();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to schedule live class.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await liveClassesApi.updateStatus(id, { status });
      success(`Class status updated to ${status}.`);
      loadLiveClasses();
    } catch (err) {
      error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this live class?')) return;
    try {
      await liveClassesApi.delete(id);
      success('Live class deleted.');
      loadLiveClasses();
    } catch (err) {
      error('Failed to delete live class.');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-4" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const liveNow = liveClasses.filter((c) => c.status === 'Live');
  const upcoming = liveClasses.filter((c) => c.status === 'Scheduled');
  const past = liveClasses.filter((c) => c.status === 'Completed');

  return (
    <div className="mt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Virtual Live Classes & Video Streaming</h2>
            {liveNow.length > 0 && (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-black animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>LIVE NOW</span>
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Interactive webinars, workshops, and office hours powered by Zoom, Google Meet, & Teams
          </p>
        </div>

        {isInstructorOrAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Zoom Live Class</span>
          </button>
        )}
      </div>

      {/* Cloud Recording Replay Player (if active) */}
      {activeRecording && (
        <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl shadow-xl text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tv className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm">Streaming Recorded Class Session</h3>
            </div>
            <button
              onClick={() => setActiveRecording(null)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg"
            >
              Close Player
            </button>
          </div>
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <iframe
              src={activeRecording}
              title="Class Recording Stream"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Live Classes Grid */}
      <div className="space-y-4">
        {liveClasses.length > 0 ? (
          liveClasses.map((item) => {
            const isItemLive = item.status === 'Live';
            const isCompleted = item.status === 'Completed';

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isItemLive
                    ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200'
                    : isCompleted
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Left Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-600 text-white flex items-center space-x-1 shadow-xs">
                      <Video className="w-3.5 h-3.5" />
                      <span>{item.platform}</span>
                    </span>

                    {isItemLive ? (
                      <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>BROADCASTING LIVE</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                        Completed Session
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                        Upcoming Class
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  {/* Metadata and Credentials */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">
                        {new Date(item.scheduledStartTime).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.durationMinutes} mins</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Host: {item.instructorName}</span>
                    </div>
                  </div>

                  {/* Meeting ID & Passcode Card */}
                  {(item.meetingId || item.passcode) && (
                    <div className="inline-flex flex-wrap items-center gap-3 p-2 bg-slate-100/90 rounded-xl text-xs font-mono border border-slate-200">
                      {item.meetingId && (
                        <div className="flex items-center space-x-1">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500">ID:</span>
                          <span className="font-bold text-slate-800">{item.meetingId}</span>
                          <button
                            onClick={() => copyToClipboard(item.meetingId, 'Meeting ID')}
                            className="p-1 hover:text-indigo-600"
                            title="Copy Meeting ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {item.passcode && (
                        <div className="flex items-center space-x-1 border-l border-slate-300 pl-3">
                          <Key className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500">Passcode:</span>
                          <span className="font-bold text-slate-800">{item.passcode}</span>
                          <button
                            onClick={() => copyToClipboard(item.passcode, 'Passcode')}
                            className="p-1 hover:text-indigo-600"
                            title="Copy Passcode"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 items-end justify-center">
                  {/* Join Link */}
                  {(isEnrolled || isInstructorOrAdmin) ? (
                    <a
                      href={item.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full md:w-48 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition ${
                        isItemLive
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-bounce'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>{isItemLive ? 'Join Live Now' : `Launch on ${item.platform}`}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  ) : (
                    <div className="text-xs text-slate-400 bg-slate-100 px-4 py-2 rounded-xl">
                      Enroll to join live
                    </div>
                  )}

                  {/* Replay Recording */}
                  {item.recordingUrl && (
                    <button
                      onClick={() => setActiveRecording(item.recordingUrl)}
                      className="w-full md:w-48 py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center space-x-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Watch Cloud Replay</span>
                    </button>
                  )}

                  {/* Instructor Controls */}
                  {isInstructorOrAdmin && (
                    <div className="flex items-center gap-1.5 pt-1 w-full justify-end">
                      {item.status === 'Scheduled' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Live')}
                          className="text-[11px] font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 px-2.5 py-1 rounded-lg"
                        >
                          Go Live
                        </button>
                      )}
                      {item.status === 'Live' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Completed')}
                          className="text-[11px] font-bold bg-slate-800 text-white hover:bg-slate-900 px-2.5 py-1 rounded-lg"
                        >
                          End Class
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
            <Radio className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Live Classes Scheduled</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Live sessions via Zoom, Google Meet, or Microsoft Teams will appear here when scheduled by instructors.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Schedule Live Class */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Live Class (Zoom / 3rd Party)"
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Class Topic / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Live Q&A & Code Review Session"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Video Tool / Platform *</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Jitsi Meet">Jitsi Meet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Join Meeting Link (URL)</label>
              {form.platform === 'Zoom' && (
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  ✨ Leave blank to auto-create Zoom meeting
                </span>
              )}
            </div>
            <input
              type="url"
              placeholder={form.platform === 'Zoom' ? "Leave empty for automatic Zoom meeting link generation" : "https://meet.google.com/..."}
              value={form.joinUrl}
              onChange={(e) => setForm({ ...form, joinUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting ID (optional)</label>
              <input
                type="text"
                placeholder="e.g. 987 654 3210"
                value={form.meetingId}
                onChange={(e) => setForm({ ...form, meetingId: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passcode (optional)</label>
              <input
                type="text"
                placeholder="e.g. 123456"
                value={form.passcode}
                onChange={(e) => setForm({ ...form, passcode: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={form.scheduledStartTime}
              onChange={(e) => setForm({ ...form, scheduledStartTime: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Session Description / Agenda</label>
            <textarea
              rows={3}
              placeholder="What will be covered in this live session..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Zoom Cloud Recording URL (optional)</label>
            <input
              type="url"
              placeholder="https://zoom.us/rec/play/... or YouTube replay URL"
              value={form.recordingUrl}
              onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-xl"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Schedule Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
