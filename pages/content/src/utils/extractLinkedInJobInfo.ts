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

  return result;
};
