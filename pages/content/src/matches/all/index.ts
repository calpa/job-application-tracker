import { extractGreenhouseJobInfo } from '../../utils/extractGreenhouseJobInfo';
import { extractLinkedInJobInfo } from '../../utils/extractLinkedInJobInfo';
import { isGreenhouseJobPage } from '../../utils/isGreenhouseJobPage';
import { isLinkedInJobPage } from '../../utils/isLinkedInJobPage';
import { sampleFunction } from '@src/sample-function';

console.log('[CEB] All content script loaded');

void sampleFunction();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  if (message.type === 'GET_LINKEDIN_JOB_INFO') {
    try {
      let info = {};
      if (isLinkedInJobPage()) {
        info = extractLinkedInJobInfo();
      } else if (isGreenhouseJobPage()) {
        info = extractGreenhouseJobInfo();
      }

      sendResponse({ ok: true, info });
    } catch (e) {
      console.error('[Job Tracker] Failed to extract LinkedIn job info', e);
      sendResponse({ ok: false });
    }
  }
});
