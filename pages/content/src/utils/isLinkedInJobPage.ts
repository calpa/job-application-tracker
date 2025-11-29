export const isLinkedInJobPage = (): boolean =>
  location.hostname.includes('linkedin.com') &&
  (location.pathname.includes('/jobs/view/') || location.pathname.includes('/jobs/'));
