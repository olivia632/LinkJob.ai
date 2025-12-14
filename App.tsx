import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { AddJobModal } from './components/AddJobModal';
import { Job, JobStatus, UserProfile } from './types';
import { Plus, Search, FileText, User } from 'lucide-react';

const STORAGE_KEY_JOBS = 'linkjob_jobs';
const STORAGE_KEY_PROFILE = 'linkjob_profile';

// Initial Demo Data
const initialProfile: UserProfile = {
  name: '',
  email: '',
  baseResume: ''
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Load Data on Mount
  useEffect(() => {
    const savedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
    if (savedJobs) setJobs(JSON.parse(savedJobs));
    
    const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  // Save Data on Change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  const handleAddJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    if (selectedJob?.id === updatedJob.id) {
        setSelectedJob(updatedJob);
    }
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
        setJobs(prev => prev.filter(j => j.id !== id));
        setSelectedJob(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {activeTab === 'dashboard' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Application Tracker</h1>
              <p className="text-slate-500">Manage your pipeline and tailor applications.</p>
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus size={20} /> Add Job
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search roles or companies..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <button 
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    All Jobs
                </button>
                {Object.values(JobStatus).map(status => (
                    <button 
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${statusFilter === status ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {status}
                    </button>
                ))}
             </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                    <Search className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No jobs found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">Start by adding a job description from LinkedIn or any other job board.</p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Add your first job
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onClick={setSelectedJob}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto">
             <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
              <p className="text-slate-500">This information is used to tailor your documents.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={profile.name}
                                onChange={(e) => setProfile({...profile, name: e.target.value})}
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={profile.email}
                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                placeholder="jane@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-700">Base Resume (Markdown or Text)</label>
                            <span className="text-xs text-slate-400">Copy and paste your full resume content here</span>
                        </div>
                        <div className="relative">
                            <textarea 
                                className="w-full h-96 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed resize-y"
                                value={profile.baseResume}
                                onChange={(e) => setProfile({...profile, baseResume: e.target.value})}
                                placeholder="# Jane Doe
Software Engineer...

## Experience
..."
                            />
                            <div className="absolute bottom-4 right-4 bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded border border-slate-200 pointer-events-none">
                                {profile.baseResume.length} chars
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
                           <FileText size={16} className="text-blue-500 shrink-0 mt-0.5" />
                           Tip: The AI works best if you paste a clean text version of your resume. Include all your skills, experience, and education.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Modals */}
      {selectedJob && (
        <JobDetailModal 
          job={selectedJob} 
          userBaseResume={profile.baseResume}
          onClose={() => setSelectedJob(null)}
          onUpdateJob={handleUpdateJob}
          onDeleteJob={handleDeleteJob}
        />
      )}

      {isAddModalOpen && (
        <AddJobModal 
          onAdd={handleAddJob}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

    </Layout>
  );
};

export default App;