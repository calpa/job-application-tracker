/**
 * Extracts the LinkedIn job ID from a given URL.
 *
 * @param {string} url - The URL to extract the job ID from.
 * @return {string | null} The extracted LinkedIn job ID, or null if it cannot be found.
 */
export const getLinkedInJobIdFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('linkedin.com')) return null;

    const jobId = u.searchParams.get('currentJobId');
    return jobId || null;
  } catch {
    return null;
  }
};
