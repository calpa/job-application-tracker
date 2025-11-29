import { sampleFunction } from '@src/sample-function';

console.log('[CEB] All content script loaded');

void sampleFunction();

type WorkStyle = 'onsite' | 'remote' | 'hybrid';

type LinkedInJobInfo = {
  company?: string;
  position?: string;
  workStyle?: WorkStyle;
};

const isLinkedInJobPage = () =>
  location.hostname.includes('linkedin.com') &&
  (location.pathname.includes('/jobs/view/') || location.pathname.includes('/jobs/')); // broad match

const extractLinkedInJobInfo = (): LinkedInJobInfo => {
  const result: LinkedInJobInfo = {};

  if (!isLinkedInJobPage()) {
    return result;
  }

  const titleEl =
    (document.querySelector('[data-test-job-title]') as HTMLElement | null) ||
    (document.querySelector('h1') as HTMLElement | null);

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

  const workStyleContainer = document.querySelector('.job-details-fit-level-preferences') as HTMLElement | null;

  let workStyleText = '';

  if (workStyleContainer) {
    const buttons = Array.from(workStyleContainer.querySelectorAll('button')) as HTMLElement[];
    const styleButton = buttons.find(btn => {
      const text = btn.textContent?.toLowerCase() ?? '';
      return text.includes('remote') || text.includes('hybrid') || text.includes('on-site') || text.includes('on site');
    });
    if (styleButton?.textContent) {
      workStyleText = styleButton.textContent.toLowerCase();
    }
  }

  if (titleEl?.textContent) {
    result.position = titleEl.textContent.trim();
  }

  if (companyEl?.textContent) {
    result.company = companyEl.textContent.trim();
  }

  if (workStyleText) {
    if (workStyleText.includes('remote')) {
      result.workStyle = 'remote';
    } else if (workStyleText.includes('hybrid')) {
      result.workStyle = 'hybrid';
    } else if (workStyleText.includes('on-site') || workStyleText.includes('on site')) {
      result.workStyle = 'onsite';
    }
  }

  return result;
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  if (message.type === 'GET_LINKEDIN_JOB_INFO') {
    try {
      const info = extractLinkedInJobInfo();
      sendResponse({ ok: true, info });
    } catch (e) {
      console.error('[Job Tracker] Failed to extract LinkedIn job info', e);
      sendResponse({ ok: false });
    }
  }
});
