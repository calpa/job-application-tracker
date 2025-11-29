import type { JobApplication } from '../jobTypes';
import type { FC } from 'react';

export type CurrentJobCardProps = {
  pageTitle: string;
  currentUrl: string;
  currentApplication?: JobApplication;
};

export const CurrentJobCard: FC<CurrentJobCardProps> = ({ pageTitle, currentUrl, currentApplication }) => (
  <div className="break-all text-xs text-slate-500">
    <div className="mb-1 font-semibold">Current page</div>
    <div className="truncate" title={pageTitle}>
      {pageTitle || 'No title'}
    </div>
    <div className="truncate" title={currentUrl}>
      {currentUrl || 'No URL detected'}
    </div>
    {currentApplication ? (
      <div className="mt-1 text-[11px] text-emerald-600">
        This page is already tracked ({currentApplication.status}).
      </div>
    ) : (
      <div className="mt-1 text-[11px] text-slate-500">Not tracked yet for this URL.</div>
    )}
  </div>
);
