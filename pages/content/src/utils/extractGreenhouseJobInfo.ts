import type { JobInfo } from './jobInfo';

export const extractGreenhouseJobInfo = (): JobInfo => {
  const result: JobInfo = {};

  const titleEl =
    (document.querySelector('.app-title') as HTMLElement | null) ||
    (document.querySelector('h1') as HTMLElement | null);

  const metaSiteName = document.querySelector('meta[property="og:site_name"]') as HTMLMetaElement | null;

  const docTitle = document.title ?? '';

  // "Job Application for <position> at <company>"
  const match = docTitle.match(/Job Application for (.+) at (.+)/i);
  if (match) {
    const [, position, company] = match;
    result.position = position.trim();
    result.company = company.trim();
    return result;
  }

  if (titleEl?.textContent) {
    result.position = titleEl.textContent.trim();
  }

  if (metaSiteName?.content) {
    result.company = metaSiteName.content.trim();
  }

  return result;
};
