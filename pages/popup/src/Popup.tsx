import '@src/Popup.css';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationList } from './components/ApplicationList';
import { CurrentJobCard } from './components/CurrentJobCard';
import { getTodayISO, loadApplications, saveApplications } from './jobTypes';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect, useMemo, useState } from 'react';
import type { JobApplication, JobStatus } from './jobTypes';
import type { FormEvent } from 'react';

type LinkedInJobInfoMessage = {
  type: 'GET_LINKEDIN_JOB_INFO';
};

const inferCompanyFromTitle = (title: string): string => {
  if (!title) return '';
  const beforePipe = title.split('|')[0] ?? title;
  const parts = beforePipe
    .split(' - ')
    .map(p => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 1];
  }
  return '';
};

type LinkedInJobInfoMessageResponse = {
  ok: boolean;
  info?: {
    company?: string;
    position?: string;
    workStyle?: 'onsite' | 'remote' | 'hybrid';
  };
};

const getActiveTabInfo = async (): Promise<{ url: string; title: string; id?: number }> => {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
  return {
    url: tab.url ?? '',
    title: tab.title ?? '',
    id: tab.id,
  };
};

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<JobStatus>('applied');
  const [appliedAt, setAppliedAt] = useState(getTodayISO());
  const [note, setNote] = useState('');

  const currentApplication = useMemo(
    () => applications.find(app => app.url === currentUrl),
    [applications, currentUrl],
  );

  useEffect(() => {
    const init = async () => {
      try {
        const [apps, tabInfo] = await Promise.all([loadApplications(), getActiveTabInfo()]);
        setApplications(apps);
        setCurrentUrl(tabInfo.url);
        setPageTitle(tabInfo.title);

        if (!company) {
          const inferred = inferCompanyFromTitle(tabInfo.title);
          if (inferred) {
            setCompany(inferred);
          }
        }

        const isLinkedInJob = tabInfo.url.includes('linkedin.com/jobs');
        const isGreenhouseJob = tabInfo.url.includes('job-boards.greenhouse.io');

        if (tabInfo.id && (isLinkedInJob || isGreenhouseJob)) {
          chrome.tabs.sendMessage<LinkedInJobInfoMessage, LinkedInJobInfoMessageResponse>(
            tabInfo.id,
            { type: 'GET_LINKEDIN_JOB_INFO' },
            response => {
              if (chrome.runtime.lastError || !response || !response.ok || !response.info) {
                return;
              }

              const { company: liCompany, position: liPosition, workStyle } = response.info;

              if (liCompany) {
                setCompany(liCompany);
              }

              if (!position && liPosition) {
                setPosition(liPosition);
              }

              if (workStyle && !note) {
                const label = workStyle === 'remote' ? 'Remote' : workStyle === 'hybrid' ? 'Hybrid' : 'On-site';
                setNote(prev => (prev ? prev : `Work style: ${label}`));
              }
            },
          );
        }
      } catch (_e) {
        setError('Failed to load data');
        console.error(_e);
      }
    };

    void init();
  }, [company, position, note]);

  useEffect(() => {
    if (!currentApplication) return;

    setCompany(currentApplication.company);
    setPosition(currentApplication.position);
    setStatus(currentApplication.status);
    setAppliedAt(currentApplication.appliedAt);
    setNote(currentApplication.note ?? '');
  }, [currentApplication]);

  const openApplicationUrl = (url: string) => {
    if (!url) return;
    chrome.tabs.create({ url });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!currentUrl) {
      setError('No active tab URL detected.');
      return;
    }

    if (!company.trim() && !position.trim()) {
      setError('Please enter at least company or position.');
      return;
    }

    setIsSaving(true);

    try {
      const next: JobApplication[] = (() => {
        const existingIndex = applications.findIndex(app => app.url === currentUrl);

        const base: JobApplication = {
          id: existingIndex >= 0 ? applications[existingIndex].id : `${Date.now()}`,
          url: currentUrl,
          company: company.trim() || pageTitle,
          position: position.trim(),
          status,
          appliedAt: appliedAt || getTodayISO(),
          note: note.trim() || undefined,
        };

        if (existingIndex >= 0) {
          const clone = [...applications];
          clone[existingIndex] = base;
          return clone;
        }

        return [base, ...applications];
      })();

      await saveApplications(next);
      setApplications(next);
    } catch (_e) {
      setError('Failed to save application.');
      console.error(_e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const next = applications.filter(app => app.id !== id);
    await saveApplications(next);
    setApplications(next);
  };

  const sortedApplications = useMemo(
    () =>
      [...applications].sort((a, b) => {
        if (a.appliedAt === b.appliedAt) return 0;
        return a.appliedAt < b.appliedAt ? 1 : -1;
      }),
    [applications],
  );

  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <div className={cn('mt-3 w-full max-w-xs space-y-3 text-left')}>
        <CurrentJobCard pageTitle={pageTitle} currentUrl={currentUrl} currentApplication={currentApplication} />

        <ApplicationForm
          company={company}
          position={position}
          appliedAt={appliedAt}
          note={note}
          isSaving={isSaving}
          error={error}
          hasCurrentApplication={Boolean(currentApplication)}
          isLight={isLight}
          onChangeCompany={setCompany}
          onChangePosition={setPosition}
          onChangeAppliedAt={setAppliedAt}
          onChangeNote={setNote}
          onSubmit={handleSubmit}
        />

        <ApplicationList
          applications={sortedApplications}
          isLight={isLight}
          onOpen={openApplicationUrl}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
