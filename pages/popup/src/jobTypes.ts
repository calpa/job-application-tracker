export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'wishlist';

export type JobApplication = {
  id: string;
  url: string;
  company: string;
  position: string;
  status: JobStatus;
  appliedAt: string;
  note?: string;
};

export const STORAGE_KEY = 'jobApplications';

export const getTodayISO = () => new Date().toISOString().slice(0, 10);

export const loadApplications = async (): Promise<JobApplication[]> =>
  new Promise(resolve => {
    chrome.storage.local.get([STORAGE_KEY], result => {
      const stored = result[STORAGE_KEY];
      if (Array.isArray(stored)) {
        resolve(stored as JobApplication[]);
      } else {
        resolve([]);
      }
    });
  });

export const saveApplications = async (applications: JobApplication[]): Promise<void> =>
  new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEY]: applications }, () => resolve());
  });
