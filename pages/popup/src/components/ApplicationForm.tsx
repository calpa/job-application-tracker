import { cn } from '@extension/ui';
import type { FC, FormEvent } from 'react';

export type ApplicationFormProps = {
  company: string;
  position: string;
  appliedAt: string;
  note: string;
  isSaving: boolean;
  error: string | null;
  hasCurrentApplication: boolean;
  isLight: boolean;
  onChangeCompany: (value: string) => void;
  onChangePosition: (value: string) => void;
  onChangeAppliedAt: (value: string) => void;
  onChangeNote: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export const ApplicationForm: FC<ApplicationFormProps> = ({
  company,
  position,
  appliedAt,
  note,
  isSaving,
  error,
  hasCurrentApplication,
  isLight,
  onChangeCompany,
  onChangePosition,
  onChangeAppliedAt,
  onChangeNote,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="mt-2 space-y-2 text-xs">
    <div>
      <label className="mb-1 block font-medium" htmlFor="job-company">
        Company
      </label>
      <input
        id="job-company"
        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-black"
        value={company}
        onChange={e => onChangeCompany(e.target.value)}
        placeholder="Company name"
      />
    </div>

    <div>
      <label className="mb-1 block font-medium" htmlFor="job-position">
        Position
      </label>
      <input
        id="job-position"
        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-black"
        value={position}
        onChange={e => onChangePosition(e.target.value)}
        placeholder="Job title / position"
      />
    </div>

    <div>
      <label className="mb-1 block font-medium" htmlFor="job-date">
        Date
      </label>
      <input
        type="date"
        id="job-date"
        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-black"
        value={appliedAt}
        onChange={e => onChangeAppliedAt(e.target.value)}
      />
    </div>

    <div>
      <label className="mb-1 block font-medium" htmlFor="job-note">
        Note
      </label>
      <textarea
        id="job-note"
        className="w-full resize-none rounded border border-slate-300 px-2 py-1 text-xs text-black"
        rows={2}
        value={note}
        onChange={e => onChangeNote(e.target.value)}
        placeholder="Anything to remember (referral, salary range, etc.)"
      />
    </div>

    {error && <div className="text-[11px] text-red-500">{error}</div>}

    <button
      type="submit"
      disabled={isSaving}
      className={cn(
        'mt-1 w-full rounded px-3 py-1 text-xs font-semibold shadow',
        isLight ? 'bg-blue-500 text-white' : 'bg-blue-400 text-gray-900',
        isSaving && 'cursor-not-allowed opacity-70',
      )}>
      {isSaving ? 'Saving...' : hasCurrentApplication ? 'Update this page record' : 'Add record for this page'}
    </button>
  </form>
);
