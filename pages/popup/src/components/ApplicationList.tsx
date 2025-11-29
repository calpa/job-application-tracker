import { cn } from '@extension/ui';
import type { JobApplication } from '../jobTypes';
import type { FC } from 'react';

export type ApplicationListProps = {
  applications: JobApplication[];
  isLight: boolean;
  currentJobId?: string;
  onOpen: (url: string) => void;
  onDelete: (id: string) => void;
};

export const ApplicationList: FC<ApplicationListProps> = ({
  applications,
  isLight,
  currentJobId,
  onOpen,
  onDelete,
}) => (
  <div className="mt-3 h-full w-full border-t border-slate-300 pt-2 text-xs">
    <div className="h-2/3 overflow-y-scroll">
      {applications.length === 0 ? (
        <div className="text-[11px] text-slate-500">No applications yet...</div>
      ) : (
        <ul className="space-y-1">
          {applications.map(app => (
            <li
              key={app.id}
              className={cn(
                'rounded border px-2 py-1',
                isLight ? 'border-slate-300 bg-white' : 'border-slate-600 bg-gray-700',
                currentJobId && app.id === currentJobId && 'border-yellow-300 bg-yellow-100',
              )}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{app.company || app.position || '(No title)'}</div>
                  {app.position && <div className="truncate text-[11px] text-slate-400">{app.position}</div>}
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{app.status}</span>
                    <span>{app.appliedAt}</span>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                <button
                  type="button"
                  className={cn(
                    'rounded px-2 py-0.5',
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-100',
                  )}
                  onClick={() => onOpen(app.url)}>
                  Open
                </button>
                <button type="button" className="text-red-400 hover:text-red-500" onClick={() => onDelete(app.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);
