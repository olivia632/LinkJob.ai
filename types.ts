export enum JobStatus {
  SAVED = 'SAVED',
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED'
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  url?: string;
  description: string;
  status: JobStatus;
  dateAdded: number;
  lastUpdated: number;
  tailoredResume?: string;
  coverLetter?: string;
  notes?: string;
  matchScore?: number;
  matchAnalysis?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  baseResume: string; // The markdown content of the master resume
}

export interface DragItem {
  index: number;
  id: string;
  type: string;
}