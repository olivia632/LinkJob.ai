import React from 'react';
import { Job, JobStatus } from '../types';
import { Calendar, Building, MapPin, ExternalLink, FileText, ChevronRight, BarChart3 } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
  onStatusChange?: (id: string, status: JobStatus) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, onStatusChange }) => {
  
  const statusColors = {
    [JobStatus.SAVED]: 'bg-slate-100 text-slate-600 border-slate-200',
    [JobStatus.APPLIED]: 'bg-blue-50 text-blue-700 border-blue-200',
    [JobStatus.INTERVIEWING]: 'bg-amber-50 text-amber-700 border-amber-200',
    [JobStatus.OFFER]: 'bg-green-50 text-green-700 border-green-200',
    [JobStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-500';
  };

  return (
    <div 
      onClick={() => onClick(job)}
      className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1 group-hover:text-indigo-700 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Building size={14} />
            <span>{job.company}</span>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusColors[job.status]}`}>
          {job.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 mb-4">
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            {job.location}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar size={12} />
          {new Date(job.dateAdded).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex gap-3">
            {job.matchScore !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold ${getScoreColor(job.matchScore)}`}>
                    <BarChart3 size={12} /> {job.matchScore}% Match
                </div>
            )}
            {job.tailoredResume && (
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    <FileText size={12} /> Ready
                </div>
            )}
        </div>
        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Manage <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};