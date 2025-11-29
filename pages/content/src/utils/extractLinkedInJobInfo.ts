import type { JobInfo } from './jobInfo';

/**
 * Extracts the job title from the current LinkedIn job page.
 *
 * @returns The trimmed job title, or `undefined` if it cannot be found.
 */
const extractTitle = (): string | undefined => {
  const titleEl =
    (document.querySelector('[data-test-job-title]') as HTMLElement | null) ||
    (document.querySelector('h1') as HTMLElement | null);

  const titleText = titleEl?.textContent?.trim();
  return titleText || undefined;
};

/**
 * Extracts the company name from the current LinkedIn job page.
 *
 * @returns The trimmed company name, or `undefined` if it cannot be found.
 */
const extractCompany = (): string | undefined => {
  const companyAnchor = document.querySelector(
    '.job-details-jobs-unified-top-card__company-name a',
  ) as HTMLElement | null;

  const companyContainer = document.querySelector(
    '.job-details-jobs-unified-top-card__company-name',
  ) as HTMLElement | null;

  const companyEl =
    companyAnchor ||
    (document.querySelector('[data-test-company-name]') as HTMLElement | null) ||
    (document.querySelector('a[href*="/company/"]') as HTMLElement | null) ||
    companyContainer;

  const companyText = companyEl?.textContent?.trim();
  return companyText || undefined;
};

/**
 * Extracts the work style (remote / hybrid / on-site) from the current LinkedIn job page.
 *
 * @returns The normalized work style value (`"remote"`, `"hybrid"`, or `"onsite"`),
 *          or `undefined` if it cannot be determined.
 */
const extractWorkStyle = (): JobInfo['workStyle'] | undefined => {
  const workStyleContainer = document.querySelector('.job-details-fit-level-preferences') as HTMLElement | null;

  if (!workStyleContainer) {
    return undefined;
  }

  const buttons = Array.from(workStyleContainer.querySelectorAll('button')) as HTMLElement[];
  const styleButton = buttons.find(btn => {
    const text = btn.textContent?.toLowerCase() ?? '';
    return text.includes('remote') || text.includes('hybrid') || text.includes('on-site') || text.includes('on site');
  });

  const workStyleText = styleButton?.textContent?.toLowerCase() ?? '';

  if (!workStyleText) {
    return undefined;
  }

  if (workStyleText.includes('remote')) {
    return 'remote';
  }
  if (workStyleText.includes('hybrid')) {
    return 'hybrid';
  }
  if (workStyleText.includes('on-site') || workStyleText.includes('on site')) {
    return 'onsite';
  }

  return undefined;
};

/**
 * Extracts the LinkedIn job identifier from the current page URL, if present.
 *
 * Typically this is provided as the `currentJobId` query parameter.
 */
const extractJobIdFromUrl = (): string | undefined => {
  try {
    const url = new URL(window.location.href);
    if (!url.hostname.includes('linkedin.com')) {
      return undefined;
    }

    const jobId = url.searchParams.get('currentJobId');
    return jobId || undefined;
  } catch {
    return undefined;
  }
};

/**
 * Extracts the job description text from the current LinkedIn job page.
 *
 * @returns The normalized job description text, or `undefined` if it cannot be found.
 */
const extractDescription = (): string | undefined => {
  const descriptionEl =
    (document.querySelector('.jobs-box__html-content.jobs-description-content__text--stretch') as HTMLElement | null) ||
    (document.querySelector('.jobs-box__html-content') as HTMLElement | null) ||
    (document.querySelector('.jobs-description-content__text--stretch') as HTMLElement | null);

  if (!descriptionEl?.textContent) {
    return undefined;
  }

  const text = descriptionEl.textContent.replace(/\s+/g, ' ').trim();
  // Keep note concise but informative
  return text || undefined;
};

/**
 * Parses LinkedIn's "Applied X ago" style text into an ISO date string (YYYY-MM-DD).
 *
 * Examples of supported formats:
 * - "Applied 2 seconds ago"
 * - "Applied 3 minutes ago"
 * - "Applied 5 hours ago"
 * - "Applied 2 days ago"
 * - "Applied 1 week ago"
 * - "Applied today"
 * - "Applied yesterday"
 *
 * @param text The raw applied text from LinkedIn.
 * @returns ISO date string (YYYY-MM-DD) or `undefined` if it cannot be parsed.
 */
const parseAppliedAtTextToISO = (text: string): string | undefined => {
  const normalized = text.trim().toLowerCase();
  if (!normalized.startsWith('applied')) return undefined;

  const today = new Date();

  const remainder = normalized.replace(/^applied\s*/, '').trim();

  if (remainder.startsWith('today')) {
    return today.toISOString().slice(0, 10);
  }

  if (remainder.startsWith('yesterday')) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  const match = remainder.match(/^(\d+)\s+(second|seconds|minute|minutes|hour|hours|day|days|week|weeks)\s+ago/);
  if (!match) {
    return undefined;
  }

  const value = Number.parseInt(match[1] ?? '', 10);
  if (!Number.isFinite(value) || value < 0) {
    return undefined;
  }

  const unit = match[2];
  let daysDelta = 0;

  if (
    unit === 'second' ||
    unit === 'seconds' ||
    unit === 'minute' ||
    unit === 'minutes' ||
    unit === 'hour' ||
    unit === 'hours'
  ) {
    daysDelta = 0;
  } else if (unit === 'day' || unit === 'days') {
    daysDelta = value;
  } else if (unit === 'week' || unit === 'weeks') {
    daysDelta = value * 7;
  }

  const d = new Date(today);
  d.setDate(d.getDate() - daysDelta);
  return d.toISOString().slice(0, 10);
};

/**
 * Attempts to locate the LinkedIn "Applied X ago" element and convert it to an ISO date.
 *
 * The exact DOM structure may change over time, so this uses a text-based search over
 * common inline elements.
 *
 * @returns ISO date string (YYYY-MM-DD) or `undefined` if it cannot be determined.
 */
const extractAppliedAt = (): string | undefined => {
  const candidates = Array.from(document.querySelectorAll('span, time, div')) as HTMLElement[];

  for (const el of candidates) {
    const raw = el.textContent?.trim();
    if (!raw) continue;

    if (/^Applied\s+/i.test(raw)) {
      const parsed = parseAppliedAtTextToISO(raw);
      if (parsed) {
        return parsed;
      }
    }
  }

  return undefined;
};

/**
 * Extracts structured job information from the current LinkedIn job page.
 *
 * This function reads the DOM of the active LinkedIn job posting tab and attempts to
 * collect the job title, company, work style (remote / hybrid / on-site), and
 * a concise version of the job description.
 *
 * @returns A partial {@link JobInfo} object containing any fields that could be extracted.
 */
export const extractLinkedInJobInfo = (): JobInfo => {
  const result: JobInfo = {};

  const id = extractJobIdFromUrl();
  if (id) {
    result.id = id;
  }

  const position = extractTitle();
  if (position) {
    result.position = position;
  }

  const company = extractCompany();
  if (company) {
    result.company = company;
  }

  const workStyle = extractWorkStyle();
  if (workStyle) {
    result.workStyle = workStyle;
  }

  const description = extractDescription();
  if (description) {
    result.description = description;
  }

  const appliedAt = extractAppliedAt();
  if (appliedAt) {
    result.appliedAt = appliedAt;
  }

  return result;
};
