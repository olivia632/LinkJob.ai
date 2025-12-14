import React, { useState } from 'react';
import { Job, JobStatus } from '../types';
import { extractJobDetails } from '../services/geminiService';
import { X, Linkedin, Loader2, Sparkles } from 'lucide-react';

interface AddJobModalProps {
  onAdd: (job: Job) => void;
  onClose: () => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({ onAdd, onClose }) => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSmartImport = async () => {
    if (!description.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const details = await extractJobDetails(description);
      
      const newJob: Job = {
        id: Date.now().toString(),
        title: details.title || "Untitled Role",
        company: details.company || "Unknown Company",
        location: details.location || "",
        description: description,
        status: JobStatus.SAVED,
        dateAdded: Date.now(),
        lastUpdated: Date.now()
      };
      
      onAdd(newJob);
      onClose();
    } catch (e) {
      console.error(e);
      // Fallback if AI fails
      const newJob: Job = {
        id: Date.now().toString(),
        title: "New Job Application",
        company: "Unknown",
        description: description,
        status: JobStatus.SAVED,
        dateAdded: Date.now(),
        lastUpdated: Date.now()
      };
      onAdd(newJob);
      onClose();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Linkedin className="text-[#0077b5]" /> Import Job
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Paste the job description or text from LinkedIn below. Our AI will automatically extract the title, company, and location.
        </p>

        <textarea
          className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-6"
          placeholder="Paste job description here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSmartImport}
            disabled={!description || isAnalyzing}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Smart Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};