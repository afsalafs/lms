import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enrollmentsApi } from '../api/client';
import { Award, Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CertificateView = () => {
  const { courseId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await enrollmentsApi.getCertificate(courseId);
        setCert(res.data);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.response?.data?.message || 'Certificate not available yet. Please complete all lessons first.');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [courseId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4">
        <Award className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Certificate Locked</h2>
        <p className="text-slate-500 text-xs">{errorMsg}</p>
        <Link
          to={`/courses/${courseId}`}
          className="inline-block bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm"
        >
          Return to Course Curriculum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Top Toolbar (hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to={`/courses/${courseId}`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Course
        </Link>

        <button
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Certificate PDF</span>
        </button>
      </div>

      {/* Official Certificate Canvas */}
      <div className="bg-white p-8 sm:p-14 rounded-3xl border-8 border-indigo-900/10 shadow-2xl relative overflow-hidden text-center space-y-8 print:p-8 print:border-4 print:shadow-none">
        
        {/* Background Decorative Watermark */}
        <div className="absolute -top-12 -right-12 opacity-5 pointer-events-none">
          <Award className="w-96 h-96 text-indigo-900" />
        </div>

        {/* Certificate Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest border border-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Official Certificate of Completion</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight pt-2">
            EduBerg India Academy
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Verified Educational Achievement
          </p>
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <p className="text-sm text-slate-500 italic">This certifies that</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 tracking-tight underline decoration-indigo-200 underline-offset-8">
            {cert.studentName}
          </h2>
          <p className="text-sm text-slate-500 italic pt-2">
            has successfully mastered all curriculum requirements and completed
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 max-w-2xl mx-auto">
            {cert.courseTitle}
          </h3>
        </div>

        {/* Seal and Signatures */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 px-6">
          <div className="text-center sm:text-left">
            <p className="font-serif italic font-bold text-base text-slate-800">
              {cert.instructorName}
            </p>
            <div className="w-36 h-0.5 bg-slate-300 my-1 mx-auto sm:mx-0" />
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Course Instructor
            </p>
          </div>

          {/* Golden Badge Seal */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-4 border-white shadow-lg flex flex-col items-center justify-center text-amber-950 font-bold">
            <Award className="w-7 h-7 text-amber-900" />
            <span className="text-[9px] uppercase tracking-tighter font-extrabold mt-0.5">VERIFIED</span>
          </div>

          <div className="text-center sm:text-right">
            <p className="font-mono text-xs font-semibold text-slate-700">
              {new Date(cert.issuedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <div className="w-36 h-0.5 bg-slate-300 my-1 mx-auto sm:mx-0" />
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Date Issued
            </p>
          </div>
        </div>

        {/* Certificate Identification ID */}
        <div className="text-[11px] text-slate-400 font-mono tracking-widest pt-2">
          Certificate ID: <span className="font-bold text-slate-600">{cert.certificateNumber}</span>
        </div>

      </div>
    </div>
  );
};
