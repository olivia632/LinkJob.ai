import React, { useState } from 'react';
import { Job, JobStatus } from '../types';
import { X, ExternalLink, Wand2, FileText, Check, Loader2, Save, BarChart3, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { tailorResume, generateCoverLetter, analyzeJobMatch } from '../services/geminiService';

interface JobDetailModalProps {
  job: Job;
  userBaseResume: string;
  onClose: () => void;
  onUpdateJob: (updatedJob: Job) => void;
  onDeleteJob: (id: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ 
  job, 
  userBaseResume, 
  onClose, 
  onUpdateJob,
  onDeleteJob
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'resume' | 'coverletter'>('details');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateJob({ ...job, status: e.target.value as JobStatus });
  };

  const handleAnalyzeMatch = async () => {
    if (!userBaseResume) {
        alert("Please add your Base Resume in your profile first.");
        return;
    }
    setIsAnalyzing(true);
    try {
        const result = await analyzeJobMatch(userBaseResume, job.description);
        onUpdateJob({ ...job, matchScore: result.score, matchAnalysis: result.analysis });
    } catch (e) {
        alert("Failed to analyze match.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!userBaseResume) {
      alert("Please add your Base Resume in your profile first.");
      return;
    }
    setIsGenerating(true);
    try {
      const tailored = await tailorResume(userBaseResume, job.description, customInstructions);
      onUpdateJob({ ...job, tailoredResume: tailored });
      setActiveTab('resume');
    } catch (e) {
      alert("Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!userBaseResume) {
      alert("Please add your Base Resume in your profile first.");
      return;
    }
    setIsGenerating(true);
    try {
      const letter = await generateCoverLetter(userBaseResume, job.description, customInstructions);
      onUpdateJob({ ...job, coverLetter: letter });
      setActiveTab('coverletter');
    } catch (e) {
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock API tracking check
  const checkApplicationStatus = () => {
    setIsSyncing(true);
    setTimeout(() => {
        setIsSyncing(false);
        alert("Synced with external portal: No status changes detected.");
    }, 1500);
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-slate-200';
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
            <div className="flex items-center gap-3 text-slate-600 mt-1">
              <span className="font-medium">{job.company}</span>
              {job.url && (
                <a href={job.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline text-sm">
                  View Job <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={checkApplicationStatus}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
             >
                {isSyncing ? <Loader2 size={14} className="animate-spin"/> : <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                {isSyncing ? 'Syncing...' : 'Tracking Active'}
             </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(['details', 'resume', 'coverletter'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'details' ? 'Job Details' : tab === 'resume' ? 'Tailored Resume' : 'Cover Letter'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={job.status} 
              onChange={handleStatusChange}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {Object.values(JobStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <button 
                onClick={() => onDeleteJob(job.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-3"
            >
                Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Match Analysis Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <BarChart3 size={18} className="text-indigo-500"/> Match Score
                            </h3>
                            <button 
                                onClick={handleAnalyzeMatch}
                                disabled={isAnalyzing}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                            >
                                {isAnalyzing ? 'Analyzing...' : (job.matchScore !== undefined ? 'Re-Analyze' : 'Analyze Match')}
                            </button>
                        </div>
                        
                        {job.matchScore !== undefined ? (
                            <div>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="text-3xl font-bold text-slate-800">{job.matchScore}%</div>
                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(job.matchScore)}`} 
                                            style={{ width: `${job.matchScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {job.matchAnalysis}
                                </p>
                            </div>
                        ) : (
                             <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <p className="text-sm text-slate-500 mb-2">See how well your resume fits this role.</p>
                                <button 
                                    onClick={handleAnalyzeMatch}
                                    disabled={isAnalyzing}
                                    className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50"
                                >
                                    Analyze with Gemini
                                </button>
                             </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-indigo-500"/> Description
                        </h3>
                        <div className="prose prose-slate prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                            {job.description}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm bg-gradient-to-br from-white to-indigo-50/50">
                        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                           <Sparkles size={16} /> Personalize & Generate
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">Create documents tailored to this specific job.</p>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Custom Instructions (Optional)</label>
                            <textarea 
                                className="w-full text-sm p-3 rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-20 placeholder:text-slate-400"
                                placeholder="e.g. Focus on my leadership experience, or keep the cover letter under 200 words..."
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={handleGenerateResume}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                                {job.tailoredResume ? 'Regenerate Resume' : 'Tailor Resume'}
                            </button>
                            <button 
                                onClick={handleGenerateCoverLetter}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg font-medium transition-all"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                                {job.coverLetter ? 'Regenerate Cover Letter' : 'Write Cover Letter'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="h-full flex flex-col">
              {job.tailoredResume ? (
                 <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm min-h-full">
                    <ReactMarkdown className="prose prose-slate max-w-none">
                        {job.tailoredResume}
                    </ReactMarkdown>
                 </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <Wand2 size={48} className="mb-4 opacity-20" />
                    <p>No tailored resume generated yet.</p>
                    <button onClick={handleGenerateResume} className="mt-4 text-indigo-600 font-medium hover:underline">Generate now</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'coverletter' && (
            <div className="h-full flex flex-col">
               {job.coverLetter ? (
                 <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm min-h-full">
                    <ReactMarkdown className="prose prose-slate max-w-none">
                        {job.coverLetter}
                    </ReactMarkdown>
                 </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p>No cover letter generated yet.</p>
                    <button onClick={handleGenerateCoverLetter} className="mt-4 text-indigo-600 font-medium hover:underline">Generate now</button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};